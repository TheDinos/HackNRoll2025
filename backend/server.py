from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)

CORS(app)


# Predefined texts for the game
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Python is an amazing programming language.",
    "Practice typing to improve your speed and accuracy."
]

# Simple leaderboard stored in memory
leaderboard = []

# Route to get a random text for the game
@app.route('/start', methods=['GET'])
def start_game():
    text = random.choice(texts)
    return jsonify({'text': text})

# Route to submit the player's results
@app.route('/finish', methods=['POST'])
def finish_game():
    data = request.json
    player = data.get('player', 'Anonymous')
    time = data.get('time', 0)

    # Add result to leaderboard
    leaderboard.append({'player': player, 'time': time})
    leaderboard.sort(key=lambda x: x['time'])  # Sort by time (ascending)

    return jsonify({'leaderboard': leaderboard})

if __name__ == '__main__':
    app.run(debug=True)
