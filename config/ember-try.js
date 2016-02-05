module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'ember-release',
      dependencies: {
        'ember': 'components/ember#release'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'components/ember#beta'
      },
      resolutions: {
        'ember': 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'components/ember#canary'
      },
      resolutions: {
        'ember': 'canary'
      }
    },
    {
      name: 'ember-1.13.13',
      dependencies: {
        'ember': '1.13.13'
      }
    },
    {
      name: 'ember-2.0.3',
      dependencies: {
        'ember': '2.0.3'
      }
    },
    {
      name: 'ember-2.1.2',
      dependencies: {
        'ember': '2.1.2'
      }
    },
    {
      name: 'ember-2.2.2',
      dependencies: {
        'ember': '2.2.2'
      }
    },
    {
      name: 'ember-2.3.1',
      bower: {
        dependencies: {
          "ember": "2.3.1"
        },
        resolutions: {
          "ember": "2.3.1"
        }
      }
    }
  ]
};
