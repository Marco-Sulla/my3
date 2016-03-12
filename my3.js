/**
 * @author Marco Sulla (marcosullaroma@gmail.com)
 * @date   Feb 22, 2016
 */

var my3 = {  // jshint ignore:line
    adaptCanvasToText: function (canvas, message, font_size, font_face) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 17, 2016
         */
        
        "use strict";
        
        var context = canvas.getContext('2d');
        
        if (canvas.height > canvas.width) {
            canvas.width = canvas.height;
        }
        
        
        while (true) {
            var side = MyJS.getNextPowerOfTwo(canvas.width);
            
            if (side < 128) {
                side = 128;
            }
            
            canvas.width = canvas.height = side;
            
            context.font = "Bold " + font_size + "pt " + font_face;
            
            var metrics = context.measureText(message);
            var text_width = metrics.width;
            var text_side = MyJS.getNextPowerOfTwo(Math.max(text_width, font_size));
            
            if (text_side >= 128) {
                if (side !== text_side) {
                    canvas.width = text_side;
                    continue;
                }
            }
            else if (side !== 128) {
                canvas.width = 128;
                continue;
            }
            
            break;
        }
    },
    
    
    getVector3: function (arg1, y, z) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 17, 2016
         */
        
        "use strict";
        
        var x_new;
        var y_new;
        var z_new;
        
        var args = (arguments.length === 1?[arguments[0]]:Array.apply(null, arguments));
        args = args.map(function (v, i, arr) {
            if (v === undefined) {
                return "undefined";
            }
            
            return v;
        });
        
        function bad_args_num() {
            /**
             *  @author Marco Sulla (marcosullaroma@gmail.com)
             *  @date Mar 1, 2016
             */
            
            throw new Error("Arguments must be one or three. " + 
                            "Arguments: " + args.join("; "));
        }
        
        
        if (arg1 === undefined) {
            bad_args_num();
        }
        
        if (y !== undefined) {
            if (z !== undefined) {
                x_new = arg1;
                y_new = y;
                z_new = z;
            }
            else {
                bad_args_num();
            }
        }
        else {
            if (! (arg1.x === undefined || arg1.y === undefined || 
                   arg1.z === undefined)) {
                
                x_new = arg1.x;
                y_new = arg1.y;
                z_new = arg1.z;
            }
            else if (! (arg1[0] === undefined || arg1[1] === undefined || 
                   arg1[2] === undefined)) {
                
                x_new = arg1[0];
                y_new = arg1[1];
                z_new = arg1[2];
            }
            else {
                
                throw new Error("Malformed arguments or unsupported type. " + 
                                "Arguments: " + args.join("; "));
            }
        }
        
        return new THREE.Vector3(x_new, y_new, z_new);
    },
    
    
    dispose: function (obj) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Mar 12, 2016
         */
        
        "use strict";
        
        var self = this;
        
        var children = obj.children;
        var child;
        
        if (children) {
            for (var i=0; i<children.length; i+=1) {
                child = children[i];
                
                self.dispose(child);
            }
        }
        
        var geometry = obj.geometry;
        var material = obj.material;
        
        if (geometry) {
            geometry.dispose();
        }
        
        if (material) {
            var texture = material.map;
            
            if (texture) {
                texture.dispose();
            }
            
            material.dispose();
        }
    },
    
    
    getCamera: function (scene, screen_width, screen_height, position, opts) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 17, 2016
         */
        
        "use strict";
        
        if (opts === undefined) {
            opts = {};
        }
        
        var possible_opts = ["view_angle", "near", "far", "up", "look_at"];
        
        for (var k in opts) {
            if (opts.hasOwnProperty(k)) {
                if (possible_opts.indexOf(k) < 0) {
                    throw new Error("Unknown option '" + k.toString() + "'");
                }
            }
        }
        
        if (opts["view_angle"] === undefined) {
            opts["view_angle"] = 45;
        }
        
        if (opts["near"] === undefined) {
            opts["near"] = 0.1;
        }
        
        if (opts["far"] === undefined) {
            opts["far"] = 20000;
        }
        
        if (opts["up"] === undefined) {
            opts["up"] = my3.getVector3([0, 0, 1]);
        }
        
        if (opts["look_at"] === undefined) {
            opts["look_at"] = scene.position;
        }
        
        if (opts["view_angle"] <= 0) {
            throw new Error("'view_angle' option must be a positive integer");
        }
        
        if (opts["near"] <= 0) {
            throw new Error("'near' option must be a positive integer");
        }
        
        if (opts["far"] <= 0) {
            throw new Error("'far' option must be a positive integer");
        }
        
        var aspect = screen_width / screen_height;
        var camera = new THREE.PerspectiveCamera(opts["view_angle"], aspect, opts["near"], opts["far"]);
        camera.position.copy(my3.getVector3(position));
        camera.up = my3.getVector3(opts["up"]);
        camera.lookAt(my3.getVector3(opts["look_at"]));
        
        return camera;
    },
    
    
    colorLines: function (geo, z_max, z_min) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 18, 2016
         */
        
        "use strict";
        
        var vertices = geo.vertices;
        var line_vertex;
        var line_vertex_next;
        var z_color;
        var color;
        
        for (var p=0; p<vertices.length; p+=2) {
            line_vertex = vertices[p];
            line_vertex_next = vertices[p+1];
            
            if (line_vertex_next === undefined) {
                line_vertex_next = line_vertex;
            }
            
            z_color = Math.max(line_vertex.z, line_vertex_next.z);
            z_color = Math.min(z_color, z_max);
            
            color = new THREE.Color( 0x0000ff );
            color.setHSL( 0.7 * (z_max - z_color) / (z_max - z_min), 1, 0.5 );
            
            geo.colors[p] = color;
            
            if (line_vertex_next !== undefined) {
                geo.colors[p+1] = color;
            }
        }
    },
    
    
    getAxisData: function (min, max, opts) {  //jshint ignore:line
       /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 22, 2016
         */
        
        "use strict";
        
        opts = MyJS.defVal(opts, {});
        var possible_opts = [
            "step",
            "data_num",
            "exponential",
            "precision",
            "labels",
            "callback",
        ];
        
        for (var k in opts) {
            if (opts.hasOwnProperty(k) && possible_opts.indexOf(k) < 0) {
                throw new Error("Unknown option '" + k + "'");
            }
        }
        
        var step = opts.step;
        var data_num = opts.data_num;
        var exponential = MyJS.defVal(opts.exponential, false);
        var precision = opts.precision;
        var labels = Boolean(opts.labels);
        var callback = opts.callback;
        
        if ($.type(min) !== "number") {
            throw new Error("'min' must be a number");
        }
        
        if ($.type(max) !== "number") {
            throw new Error("'max' must be a number");
        }
        
        if (max <= min) {
            throw new Error("'max' must be greater than 'min'");
        }
        
        if ((step === undefined) === (data_num === undefined)) {
            throw new Error("You have to specify at least one, and only " + 
                            "one, of these parameters: 'step' and " + 
                            "'data_num'");
        }
        
        if ($.type(exponential) !== "boolean") {
            throw new Error("'exponential' option must be a boolean");
        }
        
        if (step !== undefined && step <=0) {
            throw new Error("'step' must be > 0");
        }
        
        if (data_num !== undefined && (! MyJS.isInt(data_num) || 
                                         data_num <=0)) {
            throw new Error("'data_num' must be a positive integer");
        }
        
        if (precision !== undefined && (! MyJS.isInt(precision) || 
                                        precision < 0)) {
            throw new Error("Optional 'precision' parameter must be " + 
                            "an integer >= 0");
        }
        
        var steps;
        
        if (data_num !== undefined) {
            steps = data_num;
            step = (max - min) / (steps - 1);
        }
        else {
            steps = Math.ceil((max - min) / step) + 1;
        }
        
        var res = [];
        var val;
        var val_str;
        var step_real;
        
        for (var i=0; i<steps; i+=1) {
            if (i === steps - 1) {
                val = max;
            }
            else {
                val = min + step*i;
            }
            
            if (i === 0) {
                step_real = -val;
            }
            else if (i === 1) {
                step_real += val;
            }
            
            if (precision !== undefined) {
                if (exponential) {
                    val_str = val.toExponential(precision);
                }
                else {
                    val_str = val.toFixed(precision);
                }
            }
            else {
                val_str = val.toString();
            }
            
            if (callback) {
                val = parseFloat(val_str);
                val_str = callback(val).toString();
            }
            
            if (labels) {
                res.push(val_str);
            }
            else {
                res.push(parseFloat(val_str));
            }
        }
        
        return {"data": res, "step_real": step_real};
    },
};




// class
my3.Grid = function (opts) {  // jshint ignore:line
    /**
     *  @author Sue Lockwood
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  
     *  https://bocoup.com/weblog/learning-three-js-with-real-world-challenges-that-have-already-been-solved
     *  
     */
    
    "use strict";
    
    var self = this;
    
    THREE.Object3D.call(self);
    
    if (opts === undefined) {
        opts = {};
    }
    
    var possible_opts = ["side", "step", "width", "height", "width_step", 
                         "height_step", "color", "position", "rotation"];
    
    for (var k in opts) {
        if (opts.hasOwnProperty(k)) {
            if (possible_opts.indexOf(k) < 0) {
                throw new Error("Unknown option '" + k.toString() + "'");
            }
        }
    }
    
    if (opts["step"] !== undefined) {
        if (opts["width_step"] !== undefined) {
            throw new Error("You must set only one of these options: " + 
                            "'step' and 'width_step'");
        }
        
        if (opts["height_step"] !== undefined) {
            throw new Error("You must set only one of these options: " + 
                            "'step' and 'height_step'");
        }
    }
    
    if (opts["side"] !== undefined) {
        if (opts["width"] !== undefined) {
            throw new Error("You must set only one of these options: " + 
                            "'side' and 'width'");
        }
        
        if (opts["height"] !== undefined) {
            throw new Error("You must set only one of these options: " + 
                            "'side' and 'height'");
        }
    }
    
    
    
    if (opts["side"] === undefined) {
        opts["side"] = 10;
    }
    
    if (opts["step"] === undefined) {
        opts["step"] = 1;
    }
    
    if (opts["width"] === undefined) {
        opts["width"] = opts["side"];
    }
    
    if (opts["height"] === undefined) {
        opts["height"] = opts["side"];
    }
    
    if (opts["width_step"] === undefined) {
        opts["width_step"] = opts["step"];
    }
    
    if (opts["height_step"] === undefined) {
        opts["height_step"] = opts["step"];
    }
    
    if (opts["width"] <= 0) {
        throw new Error("'width' option must be a positive integer");
    }
    
    if (opts["height"] <= 0) {
        throw new Error("'height' option must be a positive integer");
    }
    
    if (opts["width_step"] <= 0) {
        throw new Error("'width_step' option must be a positive integer");
    }
    
    if (opts["height_step"] <= 0) {
        throw new Error("'height_step' option must be a positive integer");
    }
    
    if (opts["color"] === undefined) {
        opts["color"] = 0xDD006C;
    }
    
    if (opts["position"] === undefined) {
        opts["position"] = [0, 0, 0];
    }
    
    if (opts["rotation"] === undefined) {
        opts["rotation"] = {};
    }
    
    var rotation = opts["rotation"];
    
    
    var material = new THREE.LineBasicMaterial({
        color: opts.color,
    });
    
    var grid_geo = new THREE.Geometry();
    var stepw = opts["width_step"];
    var steph = opts["height_step"];

    //width
    for (var i = 0; i <= opts.width; i += stepw) {
        grid_geo.vertices.push(new THREE.Vector3(i, 0, 0));
        grid_geo.vertices.push(new THREE.Vector3(i, opts.height, 0));
    }
    
    //height
    for (var j = 0; j <= opts.height; j += steph) {
        grid_geo.vertices.push(new THREE.Vector3(0, j, 0));
        grid_geo.vertices.push(new THREE.Vector3(opts.width, j, 0));
    }
    
    var line = new THREE.LineSegments( grid_geo, material );
    self.add(line);
    
    self.position.copy(my3.getVector3(opts["position"]));
    
    for (var axis in rotation) {
        if (rotation.hasOwnProperty(axis)) {
            self.rotation[axis] = rotation[axis];
        }
    }
};


my3.Grid.prototype = Object.create(THREE.Object3D.prototype);
my3.Grid.prototype.constructor = my3.Grid;




// class
my3.TextSprite = function (message, opts) {  // jshint ignore:line
    /**
     *  @author Lee Stemkoski
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  
     *  https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
     *  
     */
    
    "use strict";
    
    var self = this;
    
    if ( opts === undefined ) {
        opts = {};
    }
    
    var possible_opts = ["font_face", "font_size", "border_thickness", 
                         "border_color", "background_color", "text_color"];
    
    for (var k in opts) {
        if (opts.hasOwnProperty(k)) {
            if (possible_opts.indexOf(k) < 0) {
                throw new Error("Unknown option '" + k.toString() + "'");
            }
        }
    }
    
    if (opts["font_face"] === undefined) {
        opts["font_face"] = "Arial";
    }
    
    if (opts["font_size"] === undefined) {
        opts["font_size"] = 100;
    }
    
    var font_size = opts["font_size"];
    
    if (font_size <= 0) {
        throw new Error("'font_size' must be a positive number");
    }
    
    if (opts["border_thickness"] === undefined) {
        opts["border_thickness"] = 0;
    }
    
    if (opts["border_thickness"] < 0) {
        throw new Error("'border_thickness' must be >= 0");
    }
    
    if (opts["border_color"] === undefined) {
        opts["border_color"] = { r:0, g:0, b:0, a:1.0 };
    }
    
    if (opts["background_color"] === undefined) {
        opts["background_color"] = { r:255, g:255, b:255, a:1.0 };
    }
    
    if (opts["text_color"] === undefined) {
        opts["text_color"] = { r: 0, g: 0, b: 0, a: 1 };
    }
    
    var border_color = opts["border_color"];
    var background_color = opts["background_color"];
    var text_color = opts["text_color"];
        
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    
    my3.adaptCanvasToText(canvas, message, font_size, opts["font_face"]);
    
    var scale;
    
    if (canvas.width > 128) {
        scale = canvas.width / 128;
    }
    
    // background color
    context.fillStyle   = ("rgba(" + background_color.r + "," + 
                           background_color.g + "," + background_color.b + "," + 
                           background_color.a + ")");
    // border color
    context.strokeStyle = ("rgba(" + border_color.r + "," + border_color.g + 
                           "," + border_color.b + "," + border_color.a + ")");

    context.lineWidth = opts["border_thickness"];
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = ("rgba(" + text_color.r + "," + text_color.g + 
                           "," + text_color.b + "," + text_color.a + ")");
    
    var metrics = context.measureText( message );
    var text_width = metrics.width;

    context.fillText( message, (canvas.width - text_width) / 2, canvas.height / 2 + font_size / 2);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    var spriteMaterial = new THREE.SpriteMaterial({map: texture});
    THREE.Sprite.call(self, spriteMaterial);
    
    if (scale) {
        self.scale.set(scale, scale, 1);
    }
};


my3.TextSprite.prototype = Object.create(THREE.Sprite.prototype);
my3.TextSprite.prototype.constructor = my3.TextSprite;




// class
my3.AxisLabels = function (data, steps, position, text_opts) {
    /**
     *  @author Sue Lockwood
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  
     *  https://bocoup.com/weblog/learning-three-js-with-real-world-challenges-that-have-already-been-solved
     *  
     */
    
    "use strict";
    
    var self = this;
    
    THREE.Object3D.call(self);
    
    var p = {x:0, y:0, z:0};
    var axes = ["x", "y", "z"];
    var axis;
    
    for ( var i = 0; i < data.length; i+=1 ) {
        var label = new my3.TextSprite(data[i], text_opts);
        
        label.position.set(p.x, p.y, p.z);
        
        self.add( label );
        
        for (var j=0; j<axes.length; j+=1) {
            axis = axes[j];
            var step = steps[axis];
            
            if (step) {
                p[axis] += step;
            }
        }
    }
    
    self.position.copy(my3.getVector3(position));
};


my3.AxisLabels.prototype = Object.create(THREE.Object3D.prototype);
my3.AxisLabels.prototype.constructor = my3.AxisLabels;




// class
my3.GridAxes = function (labels, opts) {  // jshint ignore:line
    "use strict";
    
    var self = this;
    THREE.Object3D.call(self);
    
    if ( opts === undefined ) {
        opts = {};
    }
    
    var possible_opts = ["origin", "steps", "lengths", "colors", 
                         "text_color", "text_background_color", 
                         "font_size", "gaps"];
    
    for (var k in opts) {
        if (opts.hasOwnProperty(k)) {
            if (possible_opts.indexOf(k) < 0) {
                throw new Error("Unknown option '" + k.toString() + "'");
            }
        }
    }
    
    opts.gaps = MyJS.defVal(opts.gaps, [false, true, false]);
    
    if (opts["steps"] === undefined) {
        opts["steps"] = [1, 1, 1];
    }
    
    if (opts["colors"] === undefined) {
        opts["colors"] = ["red", "green", "blue"];
    }
    
    if (! (opts["steps"] instanceof Array)) {
        opts["steps"] = [opts["steps"], opts["steps"], opts["steps"]];
    }
    
    if (! (opts["colors"] instanceof Array)) {
        opts["colors"] = [opts["colors"], opts["colors"], opts["colors"]];
    }
    
    var step;
    
    for (var i=0; i<opts["steps"].length; i+=1) {
        step = opts["steps"][i];
        
        if (step <= 0) {
            throw new Error("All 'step' elements must be > 0");
        }
    }
    
    var x_step = opts["steps"][0];
    var y_step = opts["steps"][1];
    var z_step = opts["steps"][2];
    
    var grid_steps = {};
    grid_steps.x = labels[0].length;
    grid_steps.y = labels[1].length;
    grid_steps.z = labels[2].length;
    
    if (opts.gaps[0]) {
        grid_steps.x += 1;
    }
    
    if (opts.gaps[1]) {
        grid_steps.y += 1;
    }
    
    if (opts.gaps[2]) {
        grid_steps.z += 1;
    }
    
    if (opts["lengths"] === undefined) {
        opts["lengths"] = [
            grid_steps.x*x_step, 
            grid_steps.y*y_step, 
            grid_steps.z*z_step,
        ];
    }
    
    var x_length = opts["lengths"][0];
    var y_length = opts["lengths"][1];
    var z_length = opts["lengths"][2];
    var origin = my3.getVector3(opts["origin"]);
    
    if (opts.gaps[0]) {
        origin.x -= x_step;
    }
    
    if (! opts.gaps[2]) {
        origin.z += z_step;
    }
    
    var pos_z = my3.getVector3(origin.x, origin.y + y_length, origin.z + z_length);
    
    var xy_grid = new my3.Grid({
      "width": x_length,
      "height": y_length,
      "width_step": x_step,
      "height_step": y_step,
      "color": opts["colors"][0],
      "position": origin,
    });
    
    self.add(xy_grid);
    
    var grid_yz_pos = my3.getVector3(origin.x, origin.y, origin.z + z_length);
    
    var yz_grid = new my3.Grid({
      "width": y_length,
      "height": z_length,
      "width_step": y_step,
      "height_step": z_step,
      "color": opts["colors"][1],
      "position": grid_yz_pos,
      "rotation": {"y": -Math.PI/2, "z": Math.PI/2},
    });
    
    self.add(yz_grid);
    
    var zx_grid = new my3.Grid({
      "width": x_length,
      "height": z_length,
      "width_step": x_step,
      "height_step": z_step,
      "color": opts["colors"][2],
      "position": pos_z,
      "rotation": {"x": -Math.PI/2},
    });
    
    self.add(zx_grid);
    
    var text_opts = {
        "text_color": opts["text_color"],
        "background_color": opts["text_background_color"],
        "font_size": opts["font_size"],
    };
    
    var labels_x_pos_x = origin.x;
    
    if (opts.gaps[0]) {
        labels_x_pos_x += x_step;
    }
    
    
    var labels_x_pos = my3.getVector3(labels_x_pos_x, 
                                      origin.y, 
                                      origin.z);
    
    var labels_data_x = labels[0];
    var labels_x = new my3.AxisLabels(labels_data_x, {"x": x_step}, 
                                      labels_x_pos, text_opts);
    
    labels_x.position.y -= opts["font_size"] / 150;
    
    self.add(labels_x);
    
    var labels_y_pos = my3.getVector3(origin.x + x_length, 
                                  origin.y + y_step, 
                                  origin.z);
    
    var labels_data_y = labels[1];
    var labels_y = new my3.AxisLabels(labels_data_y, {"y": y_step}, 
                                      labels_y_pos, text_opts);
    
    var labels_y_arr = labels_y.children;
    var labels_y_last = labels_y_arr[labels_y_arr.length - 1];
    var box_y = new THREE.Box3().setFromObject(labels_y_last);
    labels_y.position.x += (box_y.size().x) / 2;
    
    self.add(labels_y);
    
    var labels_z_pos_z = origin.z;
    
    if (opts.gaps[2]) {
        labels_z_pos_z += z_step;
    }
    
    var labels_z_pos = my3.getVector3(origin.x, 
                                  origin.y + y_length, 
                                  labels_z_pos_z);
    
    var labels_data_z = labels[2];
    var labels_z = new my3.AxisLabels(labels_data_z, {"z": z_step}, 
                                      labels_z_pos, text_opts);
    
//    var labels_z_arr = labels_z.children;
//    var labels_z_last = labels_z_arr[labels_z_arr.length - 1];
//    var box_z = new THREE.Box3().setFromObject(labels_z_last);
//    var box_z_width_offset = (box_z.size().x) / 2;
//    labels_z.position.y -= box_z_width_offset;
//    labels_z.position.x -= box_z_width_offset;
    
    self.add(labels_z);
};


my3.GridAxes.prototype = Object.create(THREE.Object3D.prototype);
my3.GridAxes.prototype.constructor = my3.GridAxes;
