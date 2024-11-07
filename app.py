from flask import Flask, render_template, request, redirect, url_for, session
import random

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

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/create_game', methods=['POST'])
def create_game():
    num_players = int(request.form['num_players'])
    session['num_players'] = num_players
    session['players'] = []
    return redirect(url_for('assign_roles'))

@app.route('/assign_roles')
def assign_roles():
    num_players = session.get('num_players', 0)
    players = session.get('players', [])

    if not players:
        all_roles = ROLES['good'] + ROLES['evil']
        random.shuffle(all_roles)
        assigned_roles = all_roles[:num_players]

        # Assign roles ensuring game balance (similar to Avalon)
        good_count = 0
        evil_count = 0
        for role in assigned_roles:
            if role in ROLES['good']:
                good_count += 1
            else:
                evil_count += 1

        # Ensure there is at least Merlin, Percival, and the Assassin
        if good_count < 3 or evil_count < 2:
            return redirect(url_for('create_game'))

        session['players'] = assigned_roles

    return render_template('assign_roles.html', players=session['players'])

if __name__ == '__main__':
    app.run(debug=True)