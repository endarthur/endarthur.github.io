from flask import Flask, request

app = Flask(__name__)

@app.route('/location_hook', methods=["POST"])
def handle_location():
    if request.method == 'POST':
        location = request.get_json(force=True)
        with open("point.txt", "w") as f:
            f.write(f"lat;lon;acc\n{location['latitude']};{location['longitude']};{location['accuracy']}")
        return "OK"
    else:
        return "please use post for sensitive data, even on localhost."

if __name__ == "__main__":
    app.run(port="8008")
