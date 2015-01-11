Models.GameTile = function (props) {
  this.props = props;
}

Models.GameTile.newList = function (list) {
  var klass = this;
  return list.map(function (data) {
    return new klass(data);
  });
}

Models.GameTile.prototype.key = function () {
  return this.props.key;
}
