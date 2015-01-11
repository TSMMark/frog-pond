Partials = {};

Partials.Navbar = React.createClass({
  render: function () {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">

          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>

            <Link to="app" className="navbar-brand">
              Sinky Frog
            </Link>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav navbar-left">
              <li>
                <Link to="app">
                  Existing Matches
                </Link>
              </li>
              <li>
                <Link to="play">
                  + New Match
                </Link>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li>
                <Components.FacebookLogin/>
              </li>
            </ul>
          </div>
        </div>
      </nav>);
  }
});
