Database creation:
	MySql database sever (MySQL Community Server version 8.0.21).
	Database creation script is located in Database folder (CreationScript.sql).
	This script should create a new database "LinnworksTest" and user "LinnworksUser".
Backend configuration:
	Open solution file in Visual Studio 2019.
	Configure database connection string (CorrectionString setting) in appsettings.json.
	Configure log path (line 27 in appsettings.json).
	Configure Coors origins for Frontend if necessary (Startup.cs line 52).
	Start application in IIS Express (by pressing F5).
	Wait for start page to open (should be https://localhost:44348/api/status/application), do not close it.
Frontend configuration:
	Configure pathes in proxy.config.jsob if necessary (they point to backend default).
	Open Frontend folder in CMD, run "npm install" command.
	Run "ng serve --open" command. This should open browser with default frontend page.

On the start Backend application will try to create database table structure and seed default users and roles.
Default administrator has the following credentials:
	login: admin
	password: root
Other users can be created by this user in UI.