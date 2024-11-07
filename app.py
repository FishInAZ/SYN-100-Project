from flask import Flask, render_template, request, redirect, url_for, session
import random

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a secure key in production

# Custom Avalon roles
ROLES = {
    'good': [
        "National Parks Conservation Association",
        "U.S. Environmental Protection Agency",
        "U.S. Forest Service",
        "American Hiking Society",
        "National Park Service",
        "The Nature Conservancy",
        "Bureau of Land Management",
        "Travelers",
        "Tourist (Good)"
    ],
    'evil': [
        "ExxonMobil",
        "Peabody Energy",
        "Nestle",
        "ConocoPhillips",
        "Freeport-McMoRan",
        "Chevron",
        "Tourist (Evil)"
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
        session['players'] = all_roles[:num_players]

    return render_template('assign_roles.html', players=session['players'])

if __name__ == '__main__':
    app.run(debug=True)