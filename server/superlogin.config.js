module.exports = {
  testMode: {
    noEmail: !process.env.SENDGRID_USERNAME,
    debugEmail: !process.env.SENDGRID_USERNAME
  },
  security: {
    maxFailedLogins: 3
  },
  local: {
    sendConfirmEmail: true,
    requireEmailConfirm: false,
    loginOnRegistration: true,
    confirmEmailRedirectURL: '/confirm-email'
  },
  dbServer: {
    protocol: process.env.DB_HOST ? 'https://' : 'http://',
    host: process.env.DB_HOST || 'localhost:5984',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    // automatically detect if the host is Cloudant
    cloudant: process.env.DB_HOST && process.env.DB_HOST.search(/\.cloudant\.com$/) > -1,
    userDB: 'sldemo-users',
    couchAuthDB: '_users'
  },
  session: {
    adapter: 'redis',
    redis: {
      url: process.env.REDIS_URL
    }
  },
  mailer: {
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    transport: require('nodemailer-sendgrid-transport'),
    options: {
      auth: {
        api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_PASSWORD
      }
    }
  },
  userDBs: {
    model: {
      todos: {
        designDoc: '',
        permissions: ['_reader', '_writer', '_replicator']
      }
    },
    defaultDBs: {
      private: ['todos']
    },
    privatePrefix: 'sldemo',
    designDocDir: __dirname + '/designDocs'
  },
  providers: {
    facebook: {
      credentials: {
        clientID: process.env.FACEBOOK_CLIENTID,
        clientSecret: process.env.FACEBOOK_CLIENTSECRET,
        profileURL: 'https://graph.facebook.com/v2.4/me',
        profileFields: ['id', 'name', 'displayName', 'emails', 'age_range', 'link', 'gender', 'locale', 'timezone', 'updated_time', 'verified', 'picture', 'cover']
      },
      options: {
        scope: ['email', 'public_profile'],
        display: 'popup'
      }
    },
    google: {
      credentials: {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET
      },
      options: {
        scope: ['profile', 'email']
      }
    },
    github: {
      credentials: {
        clientID: process.env.GITHUB_CLIENTID,
        clientSecret: process.env.GITHUB_CLIENTSECRET,
        scope: ['user']
      }
    },
    windowslive: {
      credentials: {
        clientID: process.env.WINDOWSLIVE_CLIENTID,
        clientSecret: process.env.WINDOWSLIVE_CLIENTSECRET
      },
      options: {
        scope: ['wl.signin', 'wl.basic', 'wl.emails']
      }
    },
    linkedin: {
      credentials: {
        clientID: process.env.LINKEDIN_CLIENTID,
        clientSecret: process.env.LINKEDIN_CLIENTSECRET
      }
    }
  }
};
