function Check-Syntax {
    param([string]$File)
    $text = Get-Content $File -Raw
    $lines = $text -split "
"
    $stack = New-Object System.Collections.Stack
    for ($i=0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        for ($j=0; $j -lt $line.Length; $j++) {
            $c = $line[$j]
            if ($c -eq '{' -or $c -eq '(' -or $c -eq '[') {
                $stack.Push($c)
            } elseif ($c -eq '}' -or $c -eq ')' -or $c -eq ']') {
                if ($stack.Count -eq 0) { Write-Output "Syntax Error in ${File}: Extra $c at line $($i+1)"; return }
                $last = $stack.Pop()
                if (($last -eq '{' -and $c -ne '}') -or ($last -eq '[' -and $c -ne ']') -or ($last -eq '(' -and $c -ne ')')) {
                    Write-Output "Syntax Error in ${File}: Mismatched $c (expected to close $last) at line $($i+1)"
                    return
                }
            }
        }
    }
    if ($stack.Count -gt 0) {
        Write-Output "Syntax Error in ${File}: Unclosed $($stack.Pop())"
    } else {
        Write-Output "Syntax OK: ${File}"
    }
}
Check-Syntax "js/game.js"
Check-Syntax "js/audio.js"
