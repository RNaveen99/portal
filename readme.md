# Portal
A web application made in Node.js, Ejs, MongoDB, Redis.

The idea to was begin with - 

- a platform to conduct prelims 
- a move from paper to paperless

## Key Features
- Easy to deploy and use
- Upload the Questions (Json file) and ready to go
- Each Question can have its own marking scheme (correct, wrong, unattempted)
- Automated Result Compilation
- And many more features elaborated later

## Achievements
- Successfully conducted prelims of all technical Events of **Tech Marathon**
- Successfully conducted prelims of first round of competition conducted under **DDUC CodeChef Chapter**

TechMarathon is an annual technical fest hosted by Department of computer science, Deen Dayal Upadhyaya College, University of Delhi.

Also on the occasion of completing 10 successful years of Tech Marathon (2010-2020) efforts were made and succeeded to go green by switching to paperless structuring of events.

## Deployment
Follow these steps for deployment in a Linux based Environment

### 1. Installing Prerequisites

Before you begin installing make sure you run `sudo apt update` to get the latest version available.

    sudo apt update

Install nodejs and npm. For details/query [click here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04).

    sudo apt install nodejs
    sudo apt install npm

Install mongoDB. For details / query [click here](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04).

    sudo apt install -y mongodb

Install redis. For details / query [click here](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04).
    
    sudo apt install redis-server


### 2. Clone Project
You can simply clone the project using git as:

    git clone https://github.com/RNaveen99/portal.git
or you can simply download ZIP and extract it.

### 3. Install project dependencies
Change into project directory and install js dependencies using npm:

    cd portal
    npm install

### 4. Application Configuration
Create a duplicate file of `.env.default` as `.env` .

    cp .env.default .env

Edit `.env` file as shown below.
    
    NODE_ENV=development

    APP_PORT=3000

    # REDIS_PORT=6379
    # REDIS_HOST=my-redis-service

    # DB_PORT=27017
    # DB_HOST=my-mongo-service
    # DB_USERNAME=root
    # DB_PASSWORD=pass    

Commented lines are optional and can be deleted.

> Required fields -

`NODE_ENV` - set it to developement.

`APP_PORT` - port on which node app will run. Standard value is 3000.

> Optional fields -

`REDIS_PORT` - by default Redis run on port 6379. You can comment this line unless you change its port.

`REDIS_HOST` - it is used when **portal** is deployed using **Docker**.

`DB_PORT` - by default mongoDB run on port 27017. You can comment this line unless you change its port.

`DB_HOST` - it is used when **portal** is deployed using **Docker**.

`DB_USERNAME` - username for mongoDB.

`DB_PASSWORD` - password for mongoDB user.

### 4. Start Local Server

To begin browsing & testing the portal you'd need to start a local development server.

    npm start

This will serve your website at localhost or localhost:3000, you can now open this up in your browser and sign up.

Now, to get access to admin Dashboard follow these steps : 

Open mongo client shell.
    
    mongo

use database portal
    
    use portal

    
set privileges to admin     

    db.users.findOneAndUpdate(
    { "email" : "adminEmail@gmail.com" },
    { $set: { "privileges" : "admin" } }
    )

exit from the mongo client shell

    exit
