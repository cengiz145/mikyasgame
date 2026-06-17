try {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.OpenTextFile("js/audio-base64.js", 1);
    var code = f.ReadAll();
    f.Close();
    eval(code);
    WScript.Echo("Syntax OK");
} catch(e) {
    WScript.Echo("Syntax Error: " + e.message);
}
