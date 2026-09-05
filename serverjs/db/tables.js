const { pool } = require("./dbconnect.js");


async function createTables() {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS BillingACL (
            billingaclid          SERIAL PRIMARY KEY,
            hasBillingAccess      BOOLEAN NOT NULL DEFAULT FALSE,
            canVerifyTransaction  BOOLEAN NOT NULL DEFAULT FALSE,
            canAcceptTransaction  BOOLEAN NOT NULL DEFAULT FALSE,
            canAddTransaction     BOOLEAN NOT NULL DEFAULT FALSE,
            canDeleteTransaction  BOOLEAN NOT NULL DEFAULT FALSE,
            canViewPaymentMethod  BOOLEAN NOT NULL DEFAULT FALSE,
            canEditPaymentMethod  BOOLEAN NOT NULL DEFAULT FALSE,
            canDeletePaymentMethod BOOLEAN NOT NULL DEFAULT FALSE,
            canViewPaymentType    BOOLEAN NOT NULL DEFAULT FALSE,
            canEditPaymentType    BOOLEAN NOT NULL DEFAULT FALSE,
            canDeletePaymentType  BOOLEAN NOT NULL DEFAULT FALSE,
            created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Roles (
            roleid SERIAL PRIMARY KEY,
            roletitle VARCHAR(50) NOT NULL,
            blogAccess BOOLEAN DEFAULT FALSE,
            achievementAccess BOOLEAN DEFAULT FALSE,
            bulkmailAccess BOOLEAN DEFAULT FALSE,
            eventAccess BOOLEAN DEFAULT FALSE,
            ecAccess BOOLEAN DEFAULT FALSE,
            landingpageAccess BOOLEAN DEFAULT FALSE,
            membersAccess BOOLEAN DEFAULT FALSE,
            noticeAccess BOOLEAN DEFAULT FALSE,
            rolesAccess BOOLEAN DEFAULT FALSE,
            statisticsAccess BOOLEAN DEFAULT FALSE,
            isDefaultRole BOOLEAN DEFAULT FALSE,
            achievementmanageaccess BOOLEAN DEFAULT FALSE,
            userblogaccess BOOLEAN DEFAULT FALSE,
            billingaccess BOOLEAN DEFAULT FALSE,
            billingaclid INT REFERENCES BillingACL(billingaclid) ON DELETE SET NULL
        );


        CREATE TABLE IF NOT EXISTS Users (
            userId SERIAL PRIMARY KEY,
            fullname VARCHAR(100),
            password VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            profile_picture VARCHAR(200),
            regno VARCHAR(20) UNIQUE NOT NULL,
            session VARCHAR(10),
            phone_number VARCHAR(15),
            bio TEXT,
            linkedin_id VARCHAR(100),
            github_id VARCHAR(100),
            stop_stalk_id VARCHAR(100),
            whatsapp VARCHAR(20),
            facebook_id VARCHAR(100),
            blood_group VARCHAR(5),
            school VARCHAR(100),
            college VARCHAR(100),
            hometown VARCHAR(100),
            CV VARCHAR(200),
            experience TEXT[],
            projects TEXT[],
            skills TEXT[],
            is_alumni BOOLEAN DEFAULT FALSE,
            roleid INT NOT NULL,
            FOREIGN KEY (roleid) REFERENCES Roles(roleid) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS OTPVerification (
            id SERIAL PRIMARY KEY,
            regno VARCHAR(20) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            FOREIGN KEY (regno) REFERENCES Users(regno) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS GeneralNotices (
            noticeId SERIAL PRIMARY KEY,
            notice_provider INT,
            notice_date DATE,
            expire_date DATE,
            headline VARCHAR(200),
            notice_body TEXT,
            picture TEXT,
            file TEXT,
            FOREIGN KEY (notice_provider) REFERENCES Users(userId) ON DELETE CASCADE

        );

        CREATE TABLE IF NOT EXISTS Events (
            eventid SERIAL PRIMARY KEY,
            event_creator INT,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            headline VARCHAR(200),
            event_details TEXT,
            coverphoto TEXT,
            created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_creator) REFERENCES Users(userId) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS Event_Updates (
            event_updateid SERIAL PRIMARY KEY,
            eventid INT,
            caption TEXT,
            photos TEXT[],
            created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (eventid) REFERENCES Events(eventid) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS Skills (
            skill_id SERIAL PRIMARY KEY,
            skill VARCHAR(50),
            area VARCHAR(50)
        );
        
        CREATE TABLE IF NOT EXISTS UserSkills (
            userskillid SERIAL,
            userid INT,
            skill_id INT,
            PRIMARY KEY (userid, skill_id),
            FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE,
            FOREIGN KEY (userid) REFERENCES Users(userId) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS Teams (
            teamid SERIAL PRIMARY KEY,
            teamname VARCHAR(100),
            mentor VARCHAR(100),
            created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS TeamMembers (
            team_member_id SERIAL,
            userid INT, 
            teamid INT,
            othermember TEXT,
            other_member_institute TEXT,
            PRIMARY KEY (team_member_id),
            FOREIGN KEY (userid) REFERENCES Users(userId) ON DELETE CASCADE,
            FOREIGN KEY (teamid) REFERENCES Teams(teamid) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS Achievements (
            achieveid SERIAL PRIMARY KEY,
            teamid INT NOT NULL,
            eventname TEXT NOT NULL,
            segment TEXT NOT NULL,
            organizer VARCHAR(100),
            venu VARCHAR(100),
            startdate DATE,
            enddate DATE,
            rank VARCHAR(100),
            rankarea VARCHAR(100) NOT NULL,
            task TEXT,
            solution TEXT,
            techstack TEXT,
            resources TEXT,
            photos TEXT[],
            approval_status BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (teamid) REFERENCES Teams(teamid) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS Blogs (
            blogid SERIAL PRIMARY KEY,
            userid INT NOT NULL,
            headline TEXT,
            designation TEXT,
            current_institution TEXT,
            article TEXT,
            photos TEXT[],
            blogtype VARCHAR(200),
            approval_status BOOLEAN DEFAULT FALSE, 
            FOREIGN KEY (userid) REFERENCES Users(userId) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS Elections (
            electionid SERIAL PRIMARY KEY,
            year VARCHAR(6),
            election_type VARCHAR(50),
            batch VARCHAR(10),
            election_commissioner INT,
            assistant_commissioner INT,
            candidatereg_start TIMESTAMP,
            candidatereg_end TIMESTAMP,
            election_start TIMESTAMP,
            election_end TIMESTAMP,
            election_status VARCHAR(50) DEFAULT 'x9bzj2fq',
            FOREIGN KEY (election_commissioner) REFERENCES Users(userId) ON DELETE SET NULL,
            FOREIGN KEY (assistant_commissioner) REFERENCES Users(userId) ON DELETE SET NULL
        );

        ALTER TABLE Elections ADD COLUMN IF NOT EXISTS election_status VARCHAR(50) DEFAULT 'x9bzj2fq';

        CREATE TABLE IF NOT EXISTS ElectionsAccess (
            election_accessid SERIAL PRIMARY KEY,
            electionid INT,
            session TEXT,
            allowed_sessions TEXT[],
            FOREIGN KEY (electionid) REFERENCES Elections(electionid) ON DELETE SET NULL
        );


        CREATE TABLE IF NOT EXISTS ElectionCandidateTrack (
            election_on_arival_id SERIAL PRIMARY KEY,
            electionid INT,
            otp TEXT,
            regno TEXT,
            status TEXT DEFAULT 'registered',
            created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (electionid) REFERENCES Elections(electionid) ON DELETE SET NULL
        );


        



        CREATE TABLE IF NOT EXISTS Committeeposts (
            committeepostid SERIAL PRIMARY KEY,
            post_name VARCHAR(50)
        );



        CREATE TABLE IF NOT EXISTS ExecutiveCommittees (
            committeeid SERIAL PRIMARY KEY,
            committee_name VARCHAR(100) NOT NULL,
            year VARCHAR(6) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Committee (
            committeeid SERIAL PRIMARY KEY,
            userid INT,
            postid INT,
            electionid INT,
            executive_committeeid INT,
            service_start TIMESTAMP,
            service_end TIMESTAMP,
            FOREIGN KEY (userid) REFERENCES Users(userId) ON DELETE SET NULL,
            FOREIGN KEY (postid) REFERENCES Committeeposts(committeepostid) ON DELETE SET NULL,
            FOREIGN KEY (electionid) REFERENCES Elections(electionid) ON DELETE SET NULL,
            FOREIGN KEY (executive_committeeid) REFERENCES ExecutiveCommittees(committeeid) ON DELETE CASCADE,
            CONSTRAINT committee_exec_user_unique UNIQUE (executive_committeeid, userid)
        );

        CREATE TABLE IF NOT EXISTS candidate (
            candidate_id SERIAL PRIMARY KEY,
            electionid INT NOT NULL,
            userId INT NOT NULL,
            marka_name VARCHAR(255) NOT NULL,
            slogan VARCHAR(255),
            logo_url VARCHAR(255),
            committeepostid INT NOT NULL,
            request_approval_status BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (electionid) REFERENCES Elections(electionid),
            FOREIGN KEY (userId) REFERENCES Users(userId),
            FOREIGN KEY (committeepostid) REFERENCES Committeeposts(committeepostid)
        );
        
        CREATE TABLE IF NOT EXISTS vote_table (            
            userId INT NOT NULL, 
            candidate_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (userId, candidate_id),
            FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
            FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payment_types (            
            payment_typeid SERIAL PRIMARY KEY,
            payment_type VARCHAR(50) NOT NULL,
            year VARCHAR(6),
            subtype VARCHAR(50), 
            amount INT,
            method Text[],
            is_enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS method_types (            
            payment_methodid SERIAL PRIMARY KEY,
            method_name VARCHAR(50) NOT NULL,
            transaction_account VARCHAR(50) NOT NULL,
            account_holder VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payment (            
            paymentid SERIAL PRIMARY KEY,
            userId INT NOT NULL,
            payment_typeid INT NOT NULL,
            methodid INT NOT NULL,
            amount INT NOT NULL,
            transaction_id VARCHAR(50) NOT NULL,
            transaction_slip TEXT,
            transaction_verified BOOLEAN DEFAULT FALSE,
            payment_status BOOLEAN DEFAULT FALSE,
            verified_by INT,
            accepted_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL,
            FOREIGN KEY (payment_typeid) REFERENCES payment_types(payment_typeid) ON DELETE SET NULL,
            FOREIGN KEY (methodid) REFERENCES method_types(payment_methodid) ON DELETE SET NULL,
            FOREIGN KEY (verified_by) REFERENCES Users(userId) ON DELETE SET NULL,
            FOREIGN KEY (accepted_by) REFERENCES Users(userId) ON DELETE SET NULL
        );


        `)
    console.log("Tables created successfully")
  } catch (error) {
    console.error("Unable to create any table:", error)
  }
}


module.exports = {
    createTables
  };
  
//Deployment note: User(userid) On delete null hobe.