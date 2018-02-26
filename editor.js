var Line = function(text) {
    if(text !== void 0)
        this.text = text;
    this.length = this.text.length;
};
Line.prototype = {
    text: '',
    length: 0
};

var suggest = function(text, start, end) {

    if(start === end){

    }else{
        console.log('no')
    }
};
var Action = function() {

};
var QEditor = function(cfg) {
    Object.assign(this, cfg);
    this.initUI();
    this.initWatchers();
    this.lines = [new Line()];
    this.cursors = [];
    var Cursor = function(cfg) {
        this.start = cfg.start;
        this.end = cfg.end;
        this.reverse = false;
    };
    Cursor.prototype = {
        reverse: false,
        editor: this,
        move: function(how) {
            var main = this.reverse ? this.end : this.start;
            if(how === 'left'){
                if(main.col > 0) {
                    main.col--;
                }else{
                    if(main.row > 0){
                        main.row--;
                        main.col = this.editor.lines[main.row].length;
                    }
                }
                this.start = {row: main.row, col: main.col};
                this.end = {row: main.row, col: main.col};
            }else if(how === 'right'){
                if(main.col < this.editor.lines[main.row].length) {
                    main.col++;
                }else{
                    if(main.row < this.editor.lines.length - 1){
                        main.row++;
                        main.col = 0;
                    }
                }
                this.start = {row: main.row, col: main.col};
                this.end = {row: main.row, col: main.col};
            }
        }
    };
    this.Cursor = Cursor;
    this.actionList = [];
};

QEditor.prototype = {
    initUI: function() {
        this.renderTo.classList.add('QEditor');

        this.textarea = document.createElement('textarea');
        this.textarea.classList.add('QEditor_textarea')
        this.renderTo.appendChild(this.textarea);

        this.selectionTextarea = document.createElement('textarea');
        this.selectionTextarea.classList.add('QEditor_selectionTextarea')
        this.renderTo.appendChild(this.selectionTextarea);
        this.selectionTextarea.value = 'a\nb\nc';

        this.pre = document.createElement('pre');
        this.pre.classList.add('QEditor_pre');
        this.renderTo.appendChild(this.pre);

    },
    _offsetToPos: function(num) {
        var line = 0,
            lines = this.lines;

        for(;num>0;){
            num -= lines[line].length
            line++;
        }
        if(line>0) {
            line--;
            num -= lines[line].length;
        }

        return {row: line, col: num };
    },
    addNewLine: function() {

        this.cursors
    },
    moveCursors: function(how) {
        if(how) {
            var cursors = this.cursors, i;
            for (i = cursors.length; i > 0;) {
                cursors[--i].move(how);
            }
        }
        this.blendCursors();
        this.updateCursors();
    },
    updateCursors: function() {
        this.cursors.forEach(function(c) {
            console.log({row: c.start.row, col: c.start.col})
        });

    },
    blendCursors: function() {

    },
    insertData: function(data) {
        var _self = this,
            lines = this.lines;
        if(typeof data === 'string'){
            data = data.split(/[\r\n]/);
            this.cursors.forEach(function(cursor) {
                var line = lines[cursor.start.row],
                    text = line.text;

                if(data.length>1){
                    // insert multiple lines
                    line.text = text.substr(0, cursor.start.col)+ data[0];
                    line.length = line.text.length;
                    data[data.length - 1] += text.substr(cursor.end.col);

                    lines.splice.apply(lines, [cursor.start.row + 1, 0].concat(data.slice(1).map(function(text) {
                        return new Line(text);
                    })));

                    cursor.start.col += data[0].length;
                    cursor.end.col = cursor.start.col;

                }else{
                    if(cursor.start.row === cursor.end.row){
                        line.text = text.substr(0, cursor.start.col)+ data[0] +text.substr(cursor.end.col);
                        line.length += data[0].length - (cursor.end.col - cursor.start.col);
                        cursor.start.col += data[0].length;
                        cursor.end.col = cursor.start.col;
                    }else{

                    }
                }

            });
            this.updateCursors();
        }
        console.log(this.lines.map(function(line) {
            return line.text;
        }).join('\n'))
    },
    initWatchers: function() {
        var textarea = this.textarea,
            pre = this.pre,
            _self = this;
        textarea.addEventListener('mouseup', function() {
            if(_self.cursors.length === 0){
                _self.cursors.push(new _self.Cursor({start: _self._offsetToPos(this.selectionStart), end: _self._offsetToPos(this.selectionEnd)}));
            }
        });
        textarea.addEventListener('keypress', function(e) {
            if(e.which === 13){
                _self.insertData('\n');
            }else {
                var text = pre.innerText;
                // simplest case. TODO: remove
                pre.innerText = text.substring(0, textarea.selectionStart) + e.key + text.substr(textarea.selectionEnd);
                _self.insertData(e.key);
                //_self.moveCursors({col: 1, row: 0});
            }
        });
        textarea.addEventListener('keydown', function(e) {

                var selStartPos = this.selectionStart,
                inputVal = this.value;

            //LEFT ARROW
            if(e.keyCode === 37){
                _self.moveCursors('left');
            }
            //LEFT ARROW
            if(e.keyCode === 39){
                _self.moveCursors('right');
            }

            // If TAB pressed, insert four spaces
            if(e.keyCode === 9){
               /* input.value = inputVal.substring(0, selStartPos) + "    " + inputVal.substring(selStartPos, input.value.length);
                input.selectionStart = selStartPos + 4;
                input.selectionEnd = selStartPos + 4;
                e.preventDefault();

                highlightCode.innerHTML = input.value.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;") + "\n";
                Prism.highlightAll();*/
            }
            suggest(this.value, this.selectionStart, this.selectionEnd);
        });
        textarea.addEventListener('scroll', function(){

            var roundedScroll = Math.floor(this.scrollTop);

            // Fixes issue of desync text on mouse wheel, fuck Firefox.
            if(navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
                this.scrollTop = roundedScroll;
            }

            pre.style.top = "-" + roundedScroll + "px";
        });



        ['scroll', 'click', 'mouseover', 'wheel'].forEach(function(event){
            pre.addEventListener(event, function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        });



    }
};