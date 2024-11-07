# SYN-100
 Green Detective Game

To deploy the game locally
The setup you’ve described looks correct, and you should be able to run this on VSCode by following these steps. Here's what you should do and what you should expect to see:

### Step-by-Step to Run in VSCode

1. **Open VSCode and Terminal**:
   - Open your project in VSCode.
   - Make sure your `app.py`, `index.html`, and `assign_roles.html` files are in the correct directory structure.
     ```
     Your Project Folder/
     ├── app.py
     └── templates/
         ├── index.html
         └── assign_roles.html
     ```
   - Open a terminal by clicking **Terminal > New Terminal** or pressing (`Ctrl + ~`).

2. **Create and Activate Virtual Environment (Recommended)**:
   - Create a virtual environment if you haven't already:
     ```sh
     python3 -m venv venv
     ```
   - Activate the virtual environment:
     - **macOS/Linux**:
       ```sh
       source venv/bin/activate
       ```
     - **Windows**:
       ```sh
       venv\Scripts\activate
       ```

3. **Install Flask**:
   - Make sure you have Flask installed in your environment:
     ```sh
     pip install Flask
     ```

4. **Run the Flask Application**:
   - Run the app with:
     ```sh
     python app.py
     ```
   - You should see something like this in your terminal:
     ```
     Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
     ```

5. **Open the Browser**:
   - Open your web browser and visit [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

### Expected Outcomes

1. **Visiting the Home Page (`/`)**:
   - When you visit `http://127.0.0.1:5000/`, you should see a page with:
     - A heading that says **"Welcome to the Custom Avalon Game!"**.
     - A form asking for **"Number of Players"** with a button labeled **"Start Game"**.

2. **Starting a Game**:
   - Enter the **number of players** (between 5 and 12) and click **"Start Game"**.
   - This will send a POST request to `/create_game` and then redirect to the `/assign_roles` route.

3. **Assigning Roles (`/assign_roles`)**:
   - After clicking **"Start Game"**, the next page should display:
     - A heading saying **"Player Roles"**.
     - A list of roles assigned to the players based on the number you provided.
     - A **"Back to Home"** link that takes you back to the main page.

### Troubleshooting

If you’re still seeing a blank page or nothing is showing up:
1. **Check the Terminal for Errors**:
   - Look at the terminal where you ran `python app.py` to see if Flask is showing any error messages. Common errors can be related to missing templates, misnamed variables, or typos in the HTML files.

2. **Check Template Files**:
   - Make sure your `index.html` and `assign_roles.html` files are in a folder named `templates` in the same directory as `app.py`.
   - Make sure that the names of the templates are correct and spelled properly (`index.html`, `assign_roles.html`).

3. **Browser Cache**:
   - Try **refreshing** the page or opening it in **Incognito mode** to avoid caching issues.

4. **Debugging**:
   - You can add a debug statement in the `home()` and `assign_roles()` functions to see if they are being executed properly:
     ```python
     print("Home route triggered")
     print("Assign roles route triggered")
     ```
   - This will help you determine if Flask is correctly accessing each route.

If all goes well, your game should now be up and running, allowing you to interact with it as expected! Let me know if you encounter any issues during the process.
