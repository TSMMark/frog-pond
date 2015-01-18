Models.GameTile = function (props) {
  this.props = props;
}

Models.GameTile.DIR_FUNCS = "isAbove isRightOf isLeftOf isBelow".split(" ");

Models.GameTile.newList = function (list) {
  var klass = this;
  return list.map(function (data) {
    return new klass(data);
  });
}

Models.GameTile.prototype.key = function () {
  return this.props.key;
}

Models.GameTile.prototype.isAbove = function (otherTile) {
  return this.props.x == otherTile.props.x &&
         this.props.y == otherTile.props.y - 1;
}

Models.GameTile.prototype.isRightOf = function (otherTile) {
  return this.props.y == otherTile.props.y &&
         this.props.x == otherTile.props.x + 1;
}

Models.GameTile.prototype.isLeftOf = function (otherTile) {
  return this.props.y == otherTile.props.y &&
         this.props.x == otherTile.props.x - 1;
}

Models.GameTile.prototype.isBelow = function (otherTile) {
  return this.props.x == otherTile.props.x &&
         this.props.y == otherTile.props.y + 1;
}

Models.GameTile.prototype.isAdjacentTo = function (otherTile) {
  var self = this;
  return Models.GameTile.DIR_FUNCS.some(function (dirFuncName) {
    return self[dirFuncName](otherTile);
  });
}
