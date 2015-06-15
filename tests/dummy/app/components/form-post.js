import Ember from 'ember';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default Ember.Component.extend({
  tagName: 'form',
  service: Ember.inject.service('post-edit'),

  resource: Ember.computed('post', function() {
    return BufferedProxy.create({ content: this.get('post') });
  }).readOnly(),

  isNew: null,
  isEditing: true,

  focusOut() {
    if (!this.get('isNew')) {
      this.get('resource').applyChanges();
    }
  },

  actions: {
    edit() {
      this.set('isEditing', true);
      return false;
    },
    done() {
      this.set('isEditing', false);
      return false;
    },
    save() {
      this.set('isEditing', false);
      this.get('resource').applyChanges();
      this.sendAction('on-save', this.get('post'));
      return false;
    },
    cancel() {
      this.set('isEditing', false);
      this.get('resource').discardChanges();
      this.sendAction('on-cancel');
      return false;
    }
  }
});
