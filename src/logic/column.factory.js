'use strict';
gantt.factory('Column', [ 'moment', function(moment) {
    // Used to display the Gantt grid and header.
    // The columns are generated by the column generator.
    var Column = function(date, endDate, left, width, calendar) {
        var self = this;

        self.date = date;
        self.endDate = endDate;
        self.left = left;
        self.width = width;
        self.calendar = calendar;
        self.widthDuration = self.endDate.diff(self.date, 'milliseconds');
        self.timeFrames = [];

        if (self.calendar !== undefined) {
            var buildPushTimeFrames = function(startDate, endDate) {
                return function(timeFrame) {
                    var start = timeFrame.start;
                    if (start === undefined) {
                        start = startDate;
                    }

                    var end = timeFrame.end;
                    if (end === undefined) {
                        end = endDate;
                    }

                    if (start < self.date) {
                        start = self.date;
                    }

                    if (end > self.endDate) {
                        end = self.endDate;
                    }

                    var positionDuration = start.diff(date, 'milliseconds');
                    var position = positionDuration / self.widthDuration * self.width;

                    var timeFrameDuration = end.diff(start, 'milliseconds');
                    var timeFramePosition = timeFrameDuration / self.widthDuration * self.width;

                    self.timeFrames.push({left: position, width: timeFramePosition, date: date, timeFrame: timeFrame});
                };
            };

            var cDate = self.date;

            while (cDate < self.endDate) {
                var timeFrames = self.calendar.getTimeFrames(cDate);
                var nextCDate = moment.min(moment(cDate).startOf('day').add(1, 'day'), self.endDate);
                timeFrames = self.calendar.solve(timeFrames, cDate, nextCDate);
                angular.forEach(timeFrames, buildPushTimeFrames(cDate, nextCDate));
                cDate = nextCDate;
            }
        }

        self.clone = function() {
            return new Column(self.date.clone(), self.endDate.clone(), self.left, self.width, self.calendar);
        };

        self.containsDate = function(date) {
            return moment(date) > self.date && moment(date) <= self.endDate;
        };

        self.equals = function(other) {
            return self.date === other.date;
        };

        self.getDateByPosition = function(position) {
            if (position < 0) {
                position = 0;
            }
            if (position > self.width) {
                position = self.width;
            }

            var positionDuration = self.widthDuration / self.width * position;
            var date = moment(self.date).add(positionDuration, 'milliseconds');
            return date;
        };

        self.getPositionByDate = function(date) {
            var positionDuration = date.diff(self.date, 'milliseconds');
            var position = positionDuration / self.widthDuration * self.width;
            return self.left + position;
        };
    };
    return Column;
}]);
