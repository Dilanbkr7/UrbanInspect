$ErrorActionPreference='Stop'
$manifest=Join-Path (Get-Location) 'android/app/src/main/AndroidManifest.xml'
if(-not (Test-Path $manifest)) { throw "Falta AndroidManifest.xml" }
$txt=Get-Content -Raw -Encoding UTF8 $manifest
# No afecta al código Kotlin o Java generado.
$permisos=''
foreach($name in @('android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION')) {
 if(-not $txt.Contains($name)) { $permisos+="    <uses-permission android:name=`"$name`" />`r`n" }
}
if($permisos) { $txt=$txt.Replace('<application',"$permisos    <application") }
# Android solicita ubicación en tiempo de ejecución; la cámara usa intent nativo del plugin.
[System.IO.File]::WriteAllText($manifest,$txt,[System.Text.UTF8Encoding]::new($false))
Write-Host 'Permisos de ubicación añadidos o confirmados.'
