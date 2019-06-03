
var StringHelpers,iPrecision,rs,absArg,rse,rsf,rsep,rsfp,farr,retstr,fpRE,fps
if (!window.StringHelpers) {
  StringHelpers = new function(){
    var me = this;

    // used by the String.prototype.trim()
    me.initWhitespaceRe = /^\s\s*/;
    me.endWhitespaceRe = /\s\s*$/;
    me.whitespaceRe = /\s/;

    me.sprintf = function(fstring){
      var pad = function(str, ch, len){
        var ps = '';
        for (var i = 0; i < Math.abs(len); i++)
          ps += ch;
        return len > 0 ? str + ps : ps + str;
      }
      var processFlags = function(flags, width, rs, arg){
        var pn = function(flags, arg, rs){
          if (arg >= 0) {
            if (flags.indexOf(' ') >= 0)
              rs = ' ' + rs;
            else if (flags.indexOf('+') >= 0)
              rs = '+' + rs;
          } else
            rs = '-' + rs;
          return rs;
        }
        var iWidth = parseInt(width, 10);
        if (width.charAt(0) == '0') {
          var ec = 0;
          if (flags.indexOf(' ') >= 0 || flags.indexOf('+') >= 0)
            ec++;
          if (rs.length < (iWidth - ec))
            rs = pad(rs, '0', rs.length - (iWidth - ec));
          return pn(flags, arg, rs);
        }
        rs = pn(flags, arg, rs);
        if (rs.length < iWidth) {
          if (flags.indexOf('-') < 0)
            rs = pad(rs, ' ', rs.length - iWidth);
          else
            rs = pad(rs, ' ', iWidth - rs.length);
        }
        return rs;
      }
      var converters = new Array();
      converters['c'] = function(flags, width, precision, arg){
        if (typeof(arg) == 'number')
          return String.fromCharCode(arg);
        if (typeof(arg) == 'string')
          return arg.charAt(0);
        return '';
      }
      converters['d'] = function(flags, width, precision, arg){
        return converters['i'](flags, width, precision, arg);
      }
      converters['u'] = function(flags, width, precision, arg){
        return converters['i'](flags, width, precision, Math.abs(arg));
      }
      converters['i'] = function(flags, width, precision, arg){
        var iPrecision = parseInt(precision);
        var rs = ((Math.abs(arg)).toString().split('.'))[0];
        if (rs.length < iPrecision)
          rs = pad(rs, ' ', iPrecision - rs.length);
        return processFlags(flags, width, rs, arg);
      }
      converters['E'] = function(flags, width, precision, arg){
        return (converters['e'](flags, width, precision, arg)).toUpperCase();
      }
      converters['e'] = function(flags, width, precision, arg){
        iPrecision = parseInt(precision);
        if (isNaN(iPrecision))
          iPrecision = 6;
        rs = (Math.abs(arg)).toExponential(iPrecision);
        if (rs.indexOf('.') < 0 && flags.indexOf('#') >= 0)
          rs = rs.replace(/^(.*)(e.*)$/, '$1.$2');
        return processFlags(flags, width, rs, arg);
      }
      converters['f'] = function(flags, width, precision, arg){
        iPrecision = parseInt(precision);
        if (isNaN(iPrecision))
          iPrecision = 6;
        rs = (Math.abs(arg)).toFixed(iPrecision);
        if (rs.indexOf('.') < 0 && flags.indexOf('#') >= 0)
          rs = rs + '.';
        return processFlags(flags, width, rs, arg);
      }
      converters['G'] = function(flags, width, precision, arg){
        return (converters['g'](flags, width, precision, arg)).toUpperCase();
      }
      converters['g'] = function(flags, width, precision, arg){
        iPrecision = parseInt(precision);
        absArg = Math.abs(arg);
        rse = absArg.toExponential();
        rsf = absArg.toFixed(6);
        if (!isNaN(iPrecision)) {
          rsep = absArg.toExponential(iPrecision);
          rse = rsep.length < rse.length ? rsep : rse;
          rsfp = absArg.toFixed(iPrecision);
          rsf = rsfp.length < rsf.length ? rsfp : rsf;
        }
        if (rse.indexOf('.') < 0 && flags.indexOf('#') >= 0)
          rse = rse.replace(/^(.*)(e.*)$/, '$1.$2');
        if (rsf.indexOf('.') < 0 && flags.indexOf('#') >= 0)
          rsf = rsf + '.';
        rs = rse.length < rsf.length ? rse : rsf;

        // removes pesky exponential notation
        rs = eval(rs);

        return processFlags(flags, width, rs, arg);
      }
      converters['o'] = function(flags, width, precision, arg){
        var iPrecision = parseInt(precision);
        var rs = Math.round(Math.abs(arg)).toString(8);
        if (rs.length < iPrecision)
          rs = pad(rs, ' ', iPrecision - rs.length);
        if (flags.indexOf('#') >= 0)
          rs = '0' + rs;
        return processFlags(flags, width, rs, arg);
      }
      converters['X'] = function(flags, width, precision, arg){
        return (converters['x'](flags, width, precision, arg)).toUpperCase();
      }
      converters['x'] = function(flags, width, precision, arg){
        var iPrecision = parseInt(precision);
        arg = Math.abs(arg);
        var rs = Math.round(arg).toString(16);
        if (rs.length < iPrecision)
          rs = pad(rs, ' ', iPrecision - rs.length);
        if (flags.indexOf('#') >= 0)
          rs = '0x' + rs;
        return processFlags(flags, width, rs, arg);
      }
      converters['s'] = function(flags, width, precision, arg){
        var iPrecision = parseInt(precision);
        var rs = arg;
        if (rs.length > iPrecision)
          rs = rs.substring(0, iPrecision);
        return processFlags(flags, width, rs, 0);
      }
      farr = fstring.split('%');
      retstr = farr[0];
      fpRE = /^([-+ #]*)(\d*)\.?(\d*)([cdieEfFgGosuxX])(.*)$/;
      for (var i = 1; i < farr.length; i++) {
        fps = fpRE.exec(farr[i]);
        if (!fps)
          continue;
        if (arguments[i] != null)
          retstr += converters[fps[4]](fps[1], fps[2], fps[3], arguments[i]);
        retstr += fps[5];
      }
      return retstr;
    }

    /**
     * Take out the first comment inside a block of HTML
     *
     * @param {String} s - an HTML block
     * @return {String} s - the HTML block uncommented.
     */
    me.uncommentHTML = function(s){
      if (s.indexOf('-->') != -1 && s.indexOf('<!--') != -1) {
        return s.replace("<!--", "").replace("-->", "");
      } else {
        return s;
      }
    }
  }
}

String.prototype.trim = function(){
  var str = this;

  // The first method is faster on long strings than the second and
  // vice-versa.
  if (this.length > 6000) {
    str = this.replace(StringHelpers.initWhitespaceRe, '');
    var i = str.length;
    while (StringHelpers.whitespaceRe.test(str.charAt(--i)))
      ;
    return str.slice(0, i + 1);
  } else {
    return this.replace(StringHelpers.initWhitespaceRe, '').replace(StringHelpers.endWhitespaceRe, '');
  }


};



//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/string/capitalize [v1.0]

String.prototype.capitalize = function(){ //v1.0
  return this.charAt(0).toUpperCase() + this.substr(1);

};


/*
 *  stringBuffer.js - ideas from
 *  http://www.multitask.com.au/people/dion/archives/000354.html
 */
function StringBuffer(){
  var me = this;

  var buffer = [];


  me.append = function(string){
    buffer.push(string);
    return me;
  }

  me.appendBuffer = function(bufferToAppend){
    buffer = buffer.concat(bufferToAppend);
  }

  me.toString = function(){
    return buffer.join("");
  }

  me.getLength = function(){
    return buffer.length;
  }

  me.flush = function(){
    buffer.length = 0;
  }

}



export {StringHelpers,StringBuffer}

