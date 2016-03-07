angular.module('hackoverflow.profile', [
  'hackoverflow.services',
  'ui.router'
])
.config(function ($stateProvider) {
})

.controller('UserController', function ($scope, TimeService, $state, Posts,Comments, $rootScope, Auth){
  $scope.latest = true;
  $scope.toggleLatest = function () {
    $scope.latest = !$scope.latest;
  }
  $scope.TimeService = TimeService;
  $scope.username;
  $scope.userPosts = [];
  $scope.userComments = [];
  var dates;
  var canvas = d3.select("#userPosts");
  var parseDate = d3.time.format("%Y-%m-%d");
  var padding = 2;


  Auth.getUser()
    .then(function(user){
      $scope.username = user.data.displayName;
    })

  Posts.getPosts('')
    .then(function(posts){
      posts.data.forEach(function(post) {
        if ( post.author === $scope.username ) $scope.userPosts.push(post);
        post.comments.forEach(function(comment) {
          if ( comment.author === $scope.username ) $scope.userComments.push(comment);
        })
      })
      $scope.userPosts = posts.data.filter(function(post) {
        return post.author === $scope.username;
      })
    })
    .then(function(){
      // Generate a Bates distribution of 10 random variables.
      console.log($scope.userPosts);
      dates = _.pluck($scope.userPosts, 'created').map(function(date){
        // console.log(date);
        return Date.parse(date);
      });

      console.log(dates);
      // var values = d3.range(1000).map(d3.random.bates(10));
      // A formatter for counts.
      var formatCount = d3.format(",.0f");

      var margin = {top: 10, right: 30, bottom: 30, left: 30},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var x = d3.time.scale()
          .domain([new Date('2016-03-01'), new Date('2016-03-30')])
          // .domain([0, 1])
          .range([0, width]);

      // Generate a histogram using twenty uniformly-spaced bins.
      var data = d3.layout.histogram()
          .bins(x.ticks(d3.time.day, 1))
          (dates)

          // console.log(data);

      var y = d3.scale.linear()
          // .domain([0, d3.max(data, function(d) { return d.y; })])
          .domain([0,10])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var svg = canvas.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bar = svg.selectAll(".bar")
          .data(data)
        .enter().append("g")
          .attr("class", "bar")
          .attr('x', function(d, i) {
            return i * 21;
          })
          .attr('y', function(d, i) {
            // console.log(d, i)
            return i;
          })
            // return x(new Date(d.x)); })
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          // .attr("x", 1)
          .attr("width", width / data.length - padding)
          .attr("height", function(d, i) { 
            // console.log(d);
            return height - i; });

      bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", x(data[0].dx) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { return formatCount(d.y); });

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

    })
    .catch(function(err){
      console.error(err);
    })
// time of posts
// their likes


})