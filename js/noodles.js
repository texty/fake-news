// Adapted from the following Processing example:
// http://processing.org/learning/topics/follow3.html


    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

// function to draw one noodle
    function noodle(num_points, start_point) {
        // The amount of points in the path:
        var points = num_points;

        // The distance between the points:
        var length = 20;

        var path = new Path({
            strokeColor: 'gold',
            strokeWidth: 15,
            strokeCap: 'round'
        });

        var start = start_point / [1, 100];
        var prev_point = start;
        path.add(start);

        // to generate slightly curved noodle
        for (var i = 1; i < points; i++) {
            var segment = path.segments[i - 1];
            var prev_point = segment.point;
            phi = getRandomArbitrary(-Math.PI / 25, Math.PI / 25);
            if (i == points) { // last point
                path.add(new Point(start.x, prev_point.y + length));
            } else { // for all points except last one, tilt segment with some randome angle
                path.add(prev_point + new Point(length * Math.sin(phi), length * Math.cos(phi)));
            }
        }

        path.smooth({type: 'continuous'});
        return path;

    }

var noodles;

// loop to create all noodles (static)
drawNoodle = function() {
    project.activeLayer.removeChildren();//видаляємо попередній малюнок
    noodles = [{value: a, name: 'Ненадійне джерело інформації'},
        {value: b, name: 'Недостовірна новина'},
        {value: c, name: 'Маніпулятивний заголовок'},
        {value: d, name: 'Маніпуляції з емоціями'},
        {value: e, name: 'Мова ворожнечі'},
        {value: f, name: 'Фейк'}];
    for (var i = 0; i < noodles.length; i++) {
        noodles[i].path = noodle(noodles[i].value, new Point(50 + 50 * i, 0));
    }
};

// Animate noodles
    var amount = 0.5;

    onFrame = function(event) {
        for (var k = 0; k < noodles.length; k++) {
            var path = noodles[k].path;
            var n_segments = path.segments.length;
            if (n_segments >= 2) {
                // Loop through the segments of the path:
                for (var i = 1; i <= Math.floor(n_segments * amount); i++) {

                    var segment = path.segments[n_segments - i];
                    // A cylic value between -1 and 1
                    var sinus = Math.sin(event.time * 2);

                    var sign = k % 2 ? -1 : 1;
                    // Change the x position of the segment point:
                    segment.point.x += sign * sinus / (i * 5);
                }
            }
        }
    }


