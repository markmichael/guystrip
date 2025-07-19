# Guys Trip App

## High Level Description
Every year, our friend group plans and executes a guys trip. One of the challenges is planning. There are 3 major components that need to be decided for a trip to be successful:  
- Location
- Dates
- AirBnB/accommodation 

## High level Technical details
This project only needs a frontend and a database. Because this is for a very adhoc purpose, anyone accessing the URL can use both voter/nominator functions as well as admin functions (moving from one phase of location voting to another.) The project can be deployed either with a service like cloudflare or locally with a service like ngrok to connect the other users to it. It should only use free cloud resources.

There is an option to create a trip. Each trip has a name, year, and id associated with it. There is also a way to store which stage of planning the trip is at.

### Location
Location is the most complicated. This is decided during the previous guys trip by the participants of the previous trip only (if 3 out of 6 people attended the guys trip, only those 3 will pick the next location). Location selection has 3 phases: nomination, ranked-choice vote, and final vote.

#### Nomination - Description
Each member submits any number of possible locations. This is an open process. Members can see what locations have already been nominated. They can also edit entries to combine similar results or remove entries.

#### Nomination - technical details
There is a table in the database for nominations. the columns should be the trip id, location id, and location name. On the frontend, the user has already selected which trip they are nominating for. then they proceed to a nomination screen where they can enter a string for a location.

#### Ranked Choice Vote - Description
Each user submits their top 5 in ranked order of all the nominations for the trip. Points are assigned as follows: 5 points for first choice, 4 points for second choice, and so on. The user also enters their name on their ballot. Also shown on the page is a list of people who have already cast ballots. There is a button to view results and another button to end voting.

#### Ranked Choice Vote - technical details
There is a table with a trip id, ballot id, name of voter, and ranked choices. All submissions from the frontend are final. There is an option to view the current leaderboard which shows the choice and the number of points assigned for each nomination. There is a button to end voting and proceed to the next step.

#### Final vote - description
The top 3 choices from the ranked choice vote are listed and the user gets a single vote for  the final location. There is an option to view results and end voting.

#### Final vote - technical details
there is a table with the trip id, ballot id, name of voter, and id of final choice. All votes are final.
