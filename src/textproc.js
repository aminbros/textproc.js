// has GLOBAL

function newTypeArray(type, length)
{
    return GLOBAL[type + 'Array'] === undefined ? new Array(length) :
        new GLOBAL[type + 'Array'](length);
}

function parseCharacters(c, single)
{
    var ret = [];
    if(typeof c == "string") {
        if(single && c.length != 1)
            throw new Error("character required as key given (" + c + ")");
        for(var i = 0, len = c.length; i < len; ++i)
            ret.push(c.charCodeAt(i));
    } else if(typeof c == "number" && c <= 0xFFFF) {
        ret.push(c);
    } else if(!single && c && c.constructor == Array) {
        for(var i = 0, len = c.length; i < len; ++i)
            ret.push(parseCharacters(c[i], true));
    } else {
        throw new Error("unknown key type (" + typeof c + ")");
    }
    return single ? ret[0] : ret;
}

var IGNORE_CHAR = -1;

var textproc = {
    IGNORE_CHAR: IGNORE_CHAR,
    
    rangeInc: function(from, to) {
        from = parseCharacters(from, true);
        to = parseCharacters(to, true);
        var ret = [];
        while(from <= to)
            ret.push(from++);
        return ret;
    },
    
    indexOf: function(s1, s2, i, def)
    {
        def = def || textproc.defaultdef;
        if(s1 === "")
            return 0;
        var def_map = def.map,
            correct_len = 0;
        for(var end = s2.length; i < end; ++i) {
            if(def_map[s2.charCodeAt(i)] ==
               def_map[s1.charCodeAt(correct_len)]) {
                if(++correct_len == s1.length) {
                    return i - correct_len + 1;
                }
            } else {
                correct_len = 0;
            }
        }
        return -1;
    },
    
    lastIndexOf: function(s1, s2, i, def)
    {
        def = def || textproc.defaultdef;
        if(i < 0) {
            i = s2.length + i;
        }
        if(s1 === "")
            return 0;
        var def_map = def.map,
            s1_len = s1.length,
            unchecked_len = s1_len;
        for(var end = 0; i >= end; --i) {
            if(def_map[s2.charCodeAt(i)] ==
               def_map[s1.charCodeAt(unchecked_len - 1)]) {
                if(--unchecked_len === 0) {
                    return i;
                }
            } else {
                unchecked_len = s1_len;
            }
        }
        return -1;
    },

    compare: function(s1, s2, def)
    {
        def = def || textproc.defaultdef;
        var def_map = def.map;
        for(var i = 0, len = Math.min(s1.length, s2.length); i < len; ++i) {
            var v1 = def_map[s1.charCodeAt(i)],
                v2 = def_map[s2.charCodeAt(i)];
            if(v1 == v2)
                continue;
            return v1 - v2;
        }
        return s1.length == s2.length ? 0 :
            (s1.length > s2.length ? def_map[s1.charCodeAt(s2.length)] :
                                    -def_map[s2.charCodeAt(s1.length)]);
    },

    buildDefinition: function(info)
    {
        var def = {},
            def_map = newTypeArray("Uint16", 0xFFFF);
        
        // initiate default map values
        for(var i = 0; i < def_map.length; ++i) {
            def_map[i] = i;
        }
        
        var map = info.map || [];

        for(var i = 0, len = map.length; i < len; ++i) {
            try {
                var entry = map[i],
                    chars, to_chars;
                if(entry.constructor == Array) {
                    if(entry.length != 2) {
                        throw new Error("Incorrect number of items in map entry" +
                                        "expected 2 given (" + entry.length + ")");
                    }
                    chars = entry[0];
                    to_chars = entry[1];
                } else {
                    chars = entry.chars;
                    to_chars = entry.to_char || entry.to_chars;
                }
                // prase chars
                chars = parseCharacters(chars, false);
                to_chars = parseCharacters(to_chars, false);

                if(to_chars.length != 1 && to_chars.length != chars.length) {
                    throw new Error("Invalid input to chars (" + to_chars + ")");
                }
                

                for(var c = 0, clen = chars.length; c < clen; ++c) {
                    var to_char = to_chars.length == 1 ?
                            to_chars[0] : to_chars[c];
                    if(to_char != IGNORE_CHAR &&
                       (to_char < 0 || to_char > 0xFFFF)) {
                        throw new Error("Character out of bound: " + to_char);
                    }
                    var char_val = chars[c];
                    if(char_val < 0 || char_val > 0xFFFF) {
                        throw new Error("Character out of bound: " + char_val);
                    }
                    def_map[char_val] = to_char;
                }
            } catch(err) {
                err.message += ", At map entry (" + i + ")";
                throw err;
            }
        }
        
        def.map = def_map;
        
        return def;
    },

    defs: {}
};

//// SINGLE_EXPORT textproc

