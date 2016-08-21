var textproc = require('../dist/textproc.js');
describe('textproc', function(){
    var defaultDef;

    describe('#buildDefinition', function() {
        defaultDef = textproc.buildDefinition({
            map: [
                ['a', 'a'.charCodeAt(0) + 1],
                ['bcd', 'b'.charCodeAt(0) + 1], 
                [['e','f', 'g'], 'g'.charCodeAt(0)]
            ]
        });
        
        var equal_tests = [
            ['a','b'],
            ['c', 'c'],
            ['d', 'c'],
            ['e', 'g'],
            ['f', 'g']
        ];
        for(var i = 0, len = equal_tests.length; i < len; ++i) {
            define_equal_test(equal_tests[i]);
        }

        function define_equal_test(test) {
            it('map should set ' + test[0] + ' to ' + test[1], function() {
                expect(defaultDef.map[test[0].charCodeAt(0)])
                    .toEqual(test[1].charCodeAt(0));
            });
        }
    });
    
    describe('#compare()', function(){
        it('should return less than zero when s1 is asc', function(){
            expect(textproc.compare("a", "b", defaultDef)).toBeLessThan(0);
            expect(textproc.compare("a", "a0", defaultDef)).toBeLessThan(0);
        });
        it('should return greater than zero when s1 is desc', function(){
            expect(textproc.compare("b", "a", defaultDef)).toBeGreaterThan(0);
            expect(textproc.compare("a0", "a", defaultDef)).toBeGreaterThan(0);
        });
        it('should return zero when s1 and s2 are equal', function(){
            expect(textproc.compare("a", "a", defaultDef)).toEqual(0);
            expect(textproc.compare("baa", "baa", defaultDef)).toEqual(0);
            expect(textproc.compare("aabbcc", "aabbcc", defaultDef)).toEqual(0);
        });
    });
    describe('#indexOf()', function(){
        it('should return -1 when s1 is not in s2', function(){
            expect(textproc.indexOf("Hello", "I'm lucky", 0, defaultDef)).toEqual(-1);
            expect(textproc.indexOf("Hello", "Hello, I'm lucky", 5, defaultDef)).toEqual(-1);
        });
        it('should return first index when s1 is in s2', function(){
            expect(textproc.indexOf("Hel", "I'm lucky Hel", 0, defaultDef)).toEqual(10);
            expect(textproc.indexOf("Hello", "I'm lucky, Hello", 5, defaultDef)).toEqual(11);
        });
    });
    describe('#lastIndexOf()', function(){
        it('should return -1 when s1 is not in s2', function(){
            expect(textproc.lastIndexOf("Hello", "I'm lucky", -1, defaultDef)).toEqual(-1);
            expect(textproc.lastIndexOf("Hello", "I'm lucky, Hello", -3, defaultDef)).toEqual(-1);
        });
        it('should return first index when s1 is in s2', function(){
            expect(textproc.lastIndexOf("Hel", "I'm lucky Hel", -1, defaultDef)).toEqual(10);
            expect(textproc.lastIndexOf("Hello", "Hello, I'm lucky", -4, defaultDef)).toEqual(0);
        });
    });
});
