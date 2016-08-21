function wrapJSFile(src, global_var, export_rep, single_export_rep,
                    needs_func_wrap, append) {
    var ret = '';
    if(needs_func_wrap)
        ret += "(function(" + (global_var ? 'GLOBAL' : '') + "){\n";
    else if(global_var)
        ret += "var GLOBAL = " + global_var + ";\n";
    
    src = src.replace(/^\/\/\/\/\s*EXPORT\s*(.*)$/gm, export_rep);
    src = src.replace(/^\/\/\/\/\s*SINGLE_EXPORT\s*(.*)$/gm,
                      single_export_rep);

    ret += src;

    if(append)
        ret += append;
    
    if(needs_func_wrap)
        ret += "})(" + global_var + ");\n";
    
    return ret;
}

var fs = require('fs');

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            hint: {
                options: {
                    shadow: true
                },
                src: 'src/*.js'
            }
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: ".js",
                helperNameSuffix: "helper.js",
                useHelpers: false,
                random: false,
                seed: null,
                stopOnFailure: false,
                traceFatal: true,
                reporters: {
                    console: {
                        colors: true,
                        cleanStack: 1,
                        verbosity: 3,
                        listStyle: "indent",
                        activity: true
                    }
                },
                customReporters: []
            },
            test: {
                specs: ['test/*']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');

    
    grunt.registerTask('build', 'Make js file', function() {
        var files = {
            'dist/textproc.js': {
                type: 'all',
                files: 'src/textproc.js',
                inner: [
                    {
                        type: 'custom',
                        files: 'src/defs/*.js',
                        'export': 'textproc.defs',
                    }
                ]
            }
        };

        for(var file in files) {
            var all = eval_src(files[file]);
            fs.writeFileSync(file, all);
        }
        
        function eval_src(info) {
            var all = '',
                files = grunt.file.expand(info.files),
                append = '';
            
            // search for inner if files has one entry
            if(files.length == 1 && info.inner) {
                for(var i = 0, len = info.inner.length; i < len; ++i) {
                    append += eval_src(info.inner[i]);
                }
            }
                
            for(var i = 0, len = files.length; i < len; ++i) {
                var src_file = files[i],
                    src = fs.readFileSync(src_file).toString('utf-8');
                switch(info.type) {
                case 'window':
                    src = wrapJSFile(src, 'window', 'GLOBAL.$1',
                                     'GLOBAL.$1 = $1;', true, append);
                    break;
                case 'node':
                    src = wrapJSFile(src, 'this', 'module.exports.$1',
                                     'module.exports = $1;', false, append);
                case 'all':
                    src = wrapJSFile(src, 'this.window ? window : this',
                                     'if(GLOBAL != GLOBAL.window)\n' +
                                     '  module.exports.$1\n' +
                                     'else\n' +
                                     '  GLOBAL.$1',
                                     // single
                                     'if(GLOBAL != GLOBAL.window)\n' +
                                     '  module.exports = $1;\n' +
                                     'else\n' +
                                     '  GLOBAL.$1 = $1;', true, append);
                    break;
                case 'custom':
                    src = wrapJSFile(src, info.global, info['export'] + '$1',
                                     info['export'] + '.$1 = $1;',
                                     info['needs_func_wrap'], append);
                    break;
                }
                all += src;
            }
            return all;
        }
    });
    grunt.registerTask('test', ['build', 'jasmine_nodejs']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('default', ['hint', 'build', 'jasmine_nodejs']);

};
