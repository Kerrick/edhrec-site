app.controller("RecommendationsController", function(
    $scope, $location, $timeout, $window, edhrecService) {
  $scope.loading = true;
  var query = $location.search().q;
  var queryLowerCase = query.toLowerCase();
  var getRecommendationsPromise = null;
  var commanderSearch = false;
  
  if (queryLowerCase.indexOf("tappedout") > -1 || queryLowerCase.indexOf("mtgsalvation") > -1) {
    if (query.indexOf("http") < 0) {
      query = "http://" + query;
    }
    $scope.deckUrl = query;
    getRecommendationsPromise = edhrecService.getDeckRecommendations(query);
  } else {
    commanderSearch = true;
    $scope.commander = query;
    getRecommendationsPromise = edhrecService.getCommanderRecommendations(query);
  }
  
  getRecommendationsPromise.then($.proxy(function(recommendations) {
    $scope.loading = false;
    
    // Use commander name returned by backend in case user didn't type in
    // the full name of their commander
    if (commanderSearch && recommendations.commander) {
      $scope.commander = recommendations.commander;
    }
    
    $scope.recommendations = recommendations;

    // Don't run post processing until the next digest cycle so that the
    // sections have had a chance to render.
    $timeout(function() {
      var moreRecommendations = $("#moreRecommendations #adds");
      moreRecommendations.masonry({
        itemSelector: "card-list"
      });
    }, 1000);
  }, this)).catch(function(errorMessage) {
    $scope.loading = false;
    $scope.error = errorMessage;
  });
  
  $scope.generateDeck = function(commander) {
    $location.path("/deckGenerator").search({ "commander": commander });
  };
});
