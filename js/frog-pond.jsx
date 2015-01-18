if (Meteor.isClient) {
  Meteor.startup(function () {
    updateDeps = function () {
      Collections.Users.find().fetch();
      Collections.Matches.find().fetch();

      Meteor.subscribe("matches");
      Meteor.subscribe("users");
    }

    render = function () {
      var currentUser = Meteor.user()
        , subRoutes
        , routes;

        updateDeps();
        console.log("Rendering!");

        if (currentUser) {
          subRoutes = [
            (<Route name="play" key="play" handler={Views.NewGame}/>),
            (<Route name="playMatch" key="playMatch" path="play/:matchId" handler={Views.PlayMatch}/>),
            (<DefaultRoute key="default" handler={Views.Home}/>)
          ];
        }
        else {
          subRoutes = <DefaultRoute key="default" handler={Views.SignIn}/>;
        }

        routes = (
          <Route name="app" path="/" handler={Views.App}>
            {subRoutes}
          </Route>
        );

      Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler/>,
                     document.getElementById("main-app"));
      });
    }

    updateDeps();
    Tracker.autorun(render);

    $(window).resize(_.throttle(render, 600));
  });
}

if (Meteor.isServer) {
  Meteor.publish("matches", function () {
    if (this.userId) {
      return Collections.Matches.find({ "playersIds": this.userId });
    }
    else {
      return [];
    }
  });

  Meteor.publish("users", function () {
    return Collections.Users.find();
  });
}
