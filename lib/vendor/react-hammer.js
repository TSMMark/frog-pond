// https://gist.github.com/dreame4/8a62d69920fb52fb4e09
// Example Usage:
//
// var Test = React.createClass({
//   mixins: [HammerMixin],

//   hammer: {
//     div: 'pan'
//   },

//   handlePan: function (ev) {
//     console.log('pan', ev);
//   },

//   render: function () {
//     return <div ref="div">Test</div>;
//   }
// });

// React.renderComponent(Test(), document.querySelector('#app'));
!function () {
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function enumerateObjectKeys(obj, cb, ctx) {
    var boundCb = ctx ? cb.bind(ctx) : cb;

    return Object.keys(obj).forEach(function (key) {
      boundCb(key, obj[key]);
    });
  }

  HammerMixin = {
    hammerSymbol: 'hammer',

    _hammerConfig: function () {
      return this[this.hammerSymbol]();
    },

    _handlerForRecognizer: function (recognizer) {
      var handlerName = 'handle' + capitalize(recognizer)
        , handler = this[handlerName];

      return handler
        ? handler
        : new Error('Handler `' + handlerName + '` was not found.');
    },

    _addRecognizers: function () {
      enumerateObjectKeys(this._hammerConfig(), function (key, options) {
        var self = this
          , ref = self.refs[key]
          , set = options.set
          , recognizer = options.recognizer;

        if (!ref) throw new Error('Ref `' + key + '` was not found.');

        var handler = self._handlerForRecognizer(recognizer);

        if (handler instanceof Error) throw handler;

        var hammer = new Hammer(ref.getDOMNode(), null);
        hammer.get(recognizer).set(set);

        hammer.on(recognizer, function (event) {
          return handler.call(self, event);
        });

        self._hammerInstances[key] = hammer;
      }, this);
    },

    _removeRecognizers: function () {
      enumerateObjectKeys(this._hammerInstances, function (key, _) {
        var options = this._hammerConfig()[key]
        this._hammerInstances[key].off(options.recognizer);
      }, this);
    },

    componentDidMount: function () {
      this._hammerInstances = {};
      this._addRecognizers();
    },

    componentWillUnmount: function() {
      this._removeRecognizers();
      delete this._hammerInstances;
    }
  };
}();
