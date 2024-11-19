from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import random, uuid

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a secure key in production

# Custom Avalon roles
ROLES = {
    'good': [
        "National Parks Conservation Association",  # Equivalent to Merlin
        "U.S. Environmental Protection Agency",     # Equivalent to Percival
        "U.S. Forest Service",                      # Equivalent to a Loyal Servant of Arthur
        "American Hiking Society",                  # Equivalent to a Loyal Servant of Arthur
        "National Park Service",                    # Equivalent to a Loyal Servant of Arthur
        "The Nature Conservancy",                   # Equivalent to a Loyal Servant of Arthur
        "Bureau of Land Management",                # Equivalent to a Loyal Servant of Arthur
        "Travelers",                                # Equivalent to a Loyal Servant of Arthur
        "Tourist (Good)"                            # Equivalent to a Loyal Servant of Arthur
    ],
    'evil': [
        "ExxonMobil",                               # Equivalent to Assassin
        "Peabody Energy",                           # Equivalent to Morgana
        "Nestle",                                   # Equivalent to Mordred
        "ConocoPhillips",                           # Equivalent to Oberon
        "Freeport-McMoRan",                         # Equivalent to Minion of Mordred
        "Chevron",                                  # Equivalent to Minion of Mordred
        "Tourist (Evil)"                            # Equivalent to Minion of Mordred
    ]
}

# Game rooms
game_rooms = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/create_room', methods=['POST'])
def create_room():
    room_id = str(uuid.uuid4())[:6]
    num_players = int(request.form['num_players'])
    if num_players < 5 or num_players > 10:
        return redirect(url_for('home'))
    session['room_id'] = room_id
    session['player_id'] = None
    game_rooms[room_id] = {
        'num_players': num_players,
        'players': {},
        'roles': {},
        'mission_votes': {},
        'current_mission': 1,
        'missions': [],
        'team_proposals': [],
        'team_votes': {},
        'mission_results': [],
        'leader_index': 0
    }
    return redirect(url_for('lobby', room_id=room_id))

@app.route('/lobby/<room_id>')
def lobby(room_id):
    if room_id not in game_rooms:
        return redirect(url_for('home'))
    return render_template('lobby.html', players=game_rooms[room_id]['players'].values(), room_id=room_id)

@app.route('/join_room/<room_id>', methods=['POST'])
def join_room(room_id):
    if room_id not in game_rooms:
        return redirect(url_for('home'))
    player_name = request.form['player_name']
    player_id = str(uuid.uuid4())
    session['player_id'] = player_id
    session['room_id'] = room_id
    game_rooms[room_id]['players'][player_id] = {
        'name': player_name,
        'role': None,
        'is_leader': False
    }
    return redirect(url_for('lobby', room_id=room_id))

@app.route('/assign_roles/<room_id>')
def assign_roles(room_id):
    if room_id not in game_rooms:
        return redirect(url_for('home'))
    room = game_rooms[room_id]
    num_players = len(room['players'])
    if num_players < 5:
        return redirect(url_for('lobby', room_id=room_id))

    all_roles = ROLES['good'] + ROLES['evil']
    random.shuffle(all_roles)
    assigned_roles = all_roles[:num_players]

    # Assign roles ensuring game balance (similar to Avalon)
    required_roles = ["National Parks Conservation Association", "U.S. Environmental Protection Agency", "ExxonMobil"]
    selected_roles = set(assigned_roles)
    while not all(role in selected_roles for role in required_roles):
        random.shuffle(all_roles)
        assigned_roles = all_roles[:num_players]
        selected_roles = set(assigned_roles)

    player_ids = list(room['players'].keys())
    for player_id, role in zip(player_ids, assigned_roles):
        room['players'][player_id]['role'] = role

    # Set the first leader
    room['leader_index'] = 0
    room['players'][player_ids[0]]['is_leader'] = True

    return redirect(url_for('game', room_id=room_id))

@app.route('/game/<room_id>')
def game(room_id):
    if room_id not in game_rooms:
        return redirect(url_for('home'))
    player_id = session.get('player_id', None)
    if not player_id or player_id not in game_rooms[room_id]['players']:
        return redirect(url_for('home'))
    player = game_rooms[room_id]['players'][player_id]
    room = game_rooms[room_id]
    return render_template('game.html', player=player, game_state=room)

@app.route('/propose_team/<room_id>', methods=['POST'])
def propose_team(room_id):
    if room_id not in game_rooms:
        return jsonify({'status': 'error', 'message': 'Room not found.'})
    room = game_rooms[room_id]
    player_id = session.get('player_id', None)
    if not room['players'][player_id]['is_leader']:
        return jsonify({'status': 'error', 'message': 'Only the leader can propose a team.'})

    proposed_team = request.json.get('team')
    room['team_proposals'].append(proposed_team)
    return jsonify({'status': 'success', 'team': proposed_team})

@app.route('/vote_team/<room_id>', methods=['POST'])
def vote_team(room_id):
    if room_id not in game_rooms:
        return jsonify({'status': 'error', 'message': 'Room not found.'})
    room = game_rooms[room_id]
    player_id = session.get('player_id', None)
    vote = request.json.get('vote')
    mission_number = room['current_mission']
    if mission_number not in room['team_votes']:
        room['team_votes'][mission_number] = {}
    room['team_votes'][mission_number][player_id] = vote

    # Check if all players have voted
    if len(room['team_votes'][mission_number]) == len(room['players']):
        approve_votes = list(room['team_votes'][mission_number].values()).count('approve')
        if approve_votes > len(room['players']) / 2:
            # Team approved, proceed to mission
            return jsonify({'status': 'team_approved'})
        else:
            # Team rejected, assign next leader
            assign_next_leader(room_id)
            return jsonify({'status': 'team_rejected'})

    return jsonify({'status': 'success'})

@app.route('/mission_result/<room_id>', methods=['POST'])
def mission_result(room_id):
    if room_id not in game_rooms:
        return jsonify({'status': 'error', 'message': 'Room not found.'})
    room = game_rooms[room_id]
    mission_number = room['current_mission']
    result = request.json.get('result')
    room['mission_results'].append(result)
    room['current_mission'] += 1
    assign_next_leader(room_id)
    return jsonify({'status': 'success', 'next_mission': room['current_mission']})

def assign_next_leader(room_id):
    room = game_rooms[room_id]
    player_ids = list(room['players'].keys())
    room['players'][player_ids[room['leader_index']]]['is_leader'] = False
    room['leader_index'] = (room['leader_index'] + 1) % len(player_ids)
    room['players'][player_ids[room['leader_index']]]['is_leader'] = True

if __name__ == '__main__':
    app.run(debug=True)