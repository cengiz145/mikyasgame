$content = Get-Content 'js\game.js' -Raw
$oldText = "    if (typeof ball !== 'undefined' && ball) {
        if (Math.abs(ball.vx - initialVx) > 3 || Math.abs(ball.vy - initialVy) > 3) {
            if (window.audioEngine && typeof window.audioEngine.playKickSound === 'function') {
                window.audioEngine.playKickSound();
            }
        }
    }"
$newText = "    if (typeof ball !== 'undefined' && ball) {
        if (Math.abs(ball.vx - window.lastFrameVx) > 3 || Math.abs(ball.vy - window.lastFrameVy) > 3) {
            if (window.audioEngine && typeof window.audioEngine.playKickSound === 'function') {
                window.audioEngine.playKickSound();
            }
        }
        window.lastFrameVx = ball.vx;
        window.lastFrameVy = ball.vy;
    }"
$content = $content.Replace($oldText.Replace("
", "
"), $newText)
$content = $content.Replace($oldText.Replace("
", "
"), $newText)
Set-Content 'js\game.js' $content
