var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

define(['views/cellstate', 'jquery', 'underscore', 'backbone'], function(CellState) {
  var Cell;
  Cell = (function(_super) {

    __extends(Cell, _super);

    function Cell() {
      Cell.__super__.constructor.apply(this, arguments);
    }

    Cell.prototype.hasBomb = false;

    Cell.prototype.state = CellState.hidden;

    Cell.prototype.initialize = function() {
      return this.contentDiv = this.$('#cell-content');
    };

    Cell.prototype.mark = function() {
      var neighbor, _i, _len, _ref, _results;
      if (this.state !== CellState.flagued) {
        if (this.hasBomb) {
          this.trigger('bang', this);
          return this.gotoState(CellState.mineBlown);
        } else {
          this.discover();
          if (!this.numberOfNearMines()) {
            _ref = this.neighbors;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              neighbor = _ref[_i];
              if (neighbor.state === CellState.hidden && !neighbor.hasBomb) {
                _results.push(neighbor.mark());
              }
            }
            return _results;
          }
        }
      }
    };

    Cell.prototype.flag = function() {
      if (this.state === CellState.hidden) {
        this.gotoState(CellState.flagued);
        return true;
      } else if (this.state === CellState.flagued) {
        this.gotoState(CellState.hidden);
        return true;
      }
      return false;
    };

    Cell.prototype.discover = function() {
      if (this.state === CellState.info && this.numberOfNearMines() === 0) {
        return this.gotoState(CellState.empty);
      } else if (this.state === CellState.hidden && !this.hasBomb) {
        if (this.numberOfNearMines() === 0) {
          return this.gotoState(CellState.empty);
        } else {
          this.contentDiv.html(this.numberOfNearMines());
          return this.gotoState(CellState.info);
        }
      }
    };

    Cell.prototype.numberOfNearMines = function() {
      var n;
      if (this.__nearMines != null) return this.__nearMines;
      return this.__nearMines = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.neighbors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          if (n.hasBomb) _results.push(n.hasBomb);
        }
        return _results;
      }).call(this)).length;
    };

    Cell.prototype.neighbors = function() {
      return [];
    };

    Cell.prototype.cleanCell = function() {
      return this.contentDiv.removeClass(this.state);
    };

    Cell.prototype.gotoState = function(newState) {
      this.cleanCell();
      this.state = newState;
      this.contentDiv.addClass(this.state);
      if (this.state === CellState.info) {
        return this.contentDiv.addClass('num' + this.numberOfNearMines());
      }
    };

    Cell.prototype.reset = function() {
      this.hasBomb = false;
      return this.gotoState(CellState.hidden);
    };

    Cell.prototype.gameOver = function() {
      if (this.hasBomb) return this.gotoState(CellState.mineVisible);
    };

    return Cell;

  })(Backbone.View);
  return Cell;
});
