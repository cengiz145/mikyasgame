$url = "https://api.telegram.org/bot8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA/getUpdates"
$response = Invoke-RestMethod -Uri $url
$response.result | ConvertTo-Json -Depth 5
