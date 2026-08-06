try {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.OpenTextFile("js/ui.js", 1);
    var content = f.ReadAll();
    f.Close();
    eval(content);
    WScript.Echo("Syntax OK");
} catch(e) {
    WScript.Echo("Syntax Error at line " + (e.line || "unknown") + ": " + e.description);
}
