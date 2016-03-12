/**
 * @author Marco Sulla (marcosullaroma@gmail.com)
 * @date   Jan 5, 2016
 */


function wrap(o, attr) {
    "use strict";
    
    Object.defineProperty(o.prototype, attr, {
        get: function() {
            return this.wrapped[attr];
        }
    });
}


function KeyError(wrapped) {
    /**
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  @date 13/ago/2015
     */
    
    "use strict";
    
    this.wrapped = wrapped;
    this.wrapped.name = 'KeyError';
}

KeyError.prototype = Object.create(Error.prototype);
KeyError.prototype.constructor = KeyError;

wrap(KeyError, 'name');
wrap(KeyError, 'message');
wrap(KeyError, 'stack');
wrap(KeyError, 'fileName');
wrap(KeyError, 'lineNumber');
wrap(KeyError, 'columnNumber');

KeyError.prototype.toString = function() {
    "use strict";
    
    return this.wrapped.toString();
};



var MyJS = {  // jshint ignore:line
    
    KeyError: KeyError,
    
    
    getSet: function (val) {
        "use strict";
        
        var val_new;
        
        if ($.type(val) === "array") {
            var el;
            val_new = new Set();
            
            for (var i=0; i<val.length; i+=1) {
                el = val[i];
                val_new.add(el);
            }
        }
        else if (val instanceof Set) {
            val_new = val;
        }
        else {
            val_new = new Set();
            val_new.add(val);
        }
        
        return val_new;
    },
        
        
    defVal: function (x, val) {
        "use strict";
        
        if (val === undefined) {
            throw new Error("You have to specify the 'val' parameter");
        }
        
        if (typeof x !== "undefined") {
            return x;
        }
        
        return val;
    },
    
    
    toBinaryInt: function (num) {
        /**
         * @author fernandosavio
         * http://stackoverflow.com/a/16155417/1763602
         */
        
        "use strict";
        
        return (num >>> 0).toString(2);  // jshint ignore:line
    },
    
    
    getNextPowerOfTwo: function (num) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 17, 2016
         */
        
        "use strict";
        
        var self = this;
        
        if (num < 0) {
            throw new Error("Argument must be positive");
        }
        
        var bin_str = self.toBinaryInt(num - 1);
        
        if (bin_str.indexOf("0") < 0 || bin_str === "0") {
            return num;
        }
        else {
            return Math.pow(2, bin_str.length);
        }
    },
    
    
    isInt: function (num) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date 10/lug/2015
         */
        
        "use strict";
        
        if (typeof num === "number" && Math.floor(num) === num) {
            return true;
        }
        
        return false;
    },
    
    
    isPositiveInt: function (num) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Mar 1, 2016
         */
        
        "use strict";
        
        var self = this;
        
        return self.isInt(num) && num > 0;
    },
    
    
    isNonNegativeInt: function (num) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Mar 1, 2016
         */
        
        "use strict";
        
        var self = this;
        
        return self.isInt(num) && num >= 0;
    },
    
    
    sum: function (arr) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 24, 2016
         */
        
        "use strict";
        
        function add(a, b) {
            return a + b;
        }
        
        return arr.reduce(add, 0);
    },
    
    
    sortNumeric: function (arr) {
        "use strict";
        
        arr.sort(function (a, b) { return a - b; }); 
    },
    
    
    reverseNumeric: function (arr) {
        "use strict";
        
        arr.sort(function (a, b) { return b - a; }); 
    },
    
    
    validateProperties: function (opts) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 25, 2016
         */
        
        /* WIP */
        
        "use strict";
        
        var self = this;
        
        opts = self.defVal(opts, {});
        
        
    },
    
    
    mean: function (data) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 24, 2016
         */
        
        "use strict";
        
        var self = this;
        
        var N = data.length;
        
        if (N <=0) {
            throw new Error("'data' must be an array with at least one element");
        }
        
        return self.sum(data) / N;
    },
    
    
    getStatisticalData: function (data) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 24, 2016
         */
        
        "use strict";
        
        var self = this;
        
        var qs = 0;
        var N = data.length;
        var mean = self.mean(data);
        var datum;
        
        for (var i=0; i<N; i+=1) {
            datum = data[i];
            
            qs += Math.pow((datum - mean), 2);
        }
        
        var sigmaq = qs / (N - 1);
        
        return {"sigmaq": sigmaq, "sigma": Math.sqrt(sigmaq), "mean": mean};
    },
    
    
    standardDeviationNumber: function (datum, mean, sigma) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 24, 2016
         */
        
        "use strict";

        return Math.abs(datum - mean) / sigma;
    },
    
    
    filterSpuriousData: function (data, sdn_limit, in_place) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 25, 2016
         */
        
        "use strict";
        
        var self = this;
        
        in_place = self.defVal(in_place, false);
        
        var stats_data = self.getStatisticalData(data);
        var mean = stats_data.mean;
        var sigma = stats_data.sigma;
        var sdn;
        var datum;
        var lower_index = 0;
        var upper_index = data.length - 1;
        var data_copy;
        
        if (in_place) {
            data_copy = data;
        }
        else {
            data_copy = $.extend([], data);
        }
        
        self.sortNumeric(data_copy);
        
        for (var i=0; i<data_copy.length; i+=1) {
            datum = data_copy[i];
            
            sdn = self.standardDeviationNumber(datum, mean, sigma);
            
            if (sdn > sdn_limit) {
                lower_index = i + 1;
            }
            else {
                break;
            }
        }
        
        for (var j = data_copy.length - 1; j > lower_index; j -= 1) {
            datum = data_copy[j];
            
            sdn = self.standardDeviationNumber(datum, mean, sigma);
            
            if (sdn > sdn_limit) {
                upper_index = j - 1;
            }
            else {
                break;
            }
        }
        
        return data_copy.slice(lower_index, upper_index + 1);
    },
    
    
    depth: function (arr) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Feb 29, 2016
         */
        
        "use strict";
        
        var self = this;
        
        if ($.type(arr) === "array") {
            if (arr.length === 0) {
                return 1;
            }
            
            var depths = arr.map(self.depth, self);
            
            return 1 + Math.max.apply(self, depths);
        }
        
        return 0;
    },
    
    
    popRange: function (arr, start, end) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Mar 1, 2016
         */
        
        "use strict";
        
        var self = this;
        
        if (! self.isNonNegativeInt(start)) {
            throw new Error("Parameter 'start' must be a non-negative integer");
        }
        
        if (! self.isPositiveInt(end)) {
            throw new Error("Parameter 'end' must be a positive integer");
        }
        
        if (end < start) {
            throw new Error("Parameter 'end' must be >= of parameter 'start'");
        }
        
        if (end > arr.length) {
            throw new Error("Parameter 'end' can't be greater than " + 
                            "array length");
        }
        
        return arr.splice(start, end - start);
    },
    
    
    minFiltered: function (arr) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Mar 2, 2016
         */
        
        "use strict";
        
        var self = this;
        
        var filtered_arr = arr.filter(function (el, i, arr) {
            if (el === undefined || isNaN(el)) {
                return false;
            }
            
            return true;
        });
        
        return Math.min.apply(self, filtered_arr);
    },
    
    
    maxFiltered: function (arr) {
        /**
         *  @author Marco Sulla (marcosullaroma@gmail.com)
         *  @date Mar 2, 2016
         */
        
        "use strict";
        
        var self = this;
        
        var filtered_arr = arr.filter(function (el, i, arr) {
            if (el === undefined || isNaN(el)) {
                return false;
            }
            
            return true;
        });
        
        return Math.max.apply(self, filtered_arr);
    },
};
