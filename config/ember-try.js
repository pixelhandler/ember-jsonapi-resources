module.exports = {
  scenarios: [
    {
      name: 'default',
      bower: {
        dependencies: { }
      }
    },
    {
      name: 'ember-1.13',
      bower: {
        dependencies: {
          'ember': '~1.13.0'
        },
        resolutions: {
          'ember': '~1.13.0'
        }
      }
    },
    {
      name: 'ember-release',
      bower: {
        dependencies: {
          'ember': 'components/ember#release'
        },
        resolutions: {
          'ember': 'release'
        }
      }
    },
    {
      name: 'ember-beta',
      bower: {
        dependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      }
    },
    {
      name: 'ember-canary',
      bower: {
        dependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      }
    },
    {
      name: 'ember-2.0.3',
      bower: {
        dependencies: {
          'ember': '2.0.3'
        },
        resolutions: {
          'ember': '2.0.3'
        }
      }
    },
    {
      name: 'ember-2.1.2',
      bower: {
        dependencies: {
          'ember': '2.1.2'
        },
        resolutions: {
          'ember': '2.1.2'
        }
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
          'ember': '2.3.1'
        },
        resolutions: {
          'ember': '2.3.1'
        }
      }
    },
    {
      name: 'ember-2.4.6-LTS',
      bower: {
        dependencies: {
          'ember': '2.4.6'
        },
        resolutions: {
          'ember': '2.4.6'
        }
      }
    },
    {
      name: 'ember-2.5.1',
      bower: {
        dependencies: {
          'ember': '2.5.1'
        },
        resolutions: {
          'ember': '2.5.1'
        }
      }
    }
  ]
};
