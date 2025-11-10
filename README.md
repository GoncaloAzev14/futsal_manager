# futsal_manager

to build PWA:

first commit and push
**ON MAIN BRANCH**
after, run:
* ng build --configuration production --base-href "/futsal_manager/"
* npx angular-cli-ghpages --dir=dist/futsal-manager

---

to build ionic-capacitor:

**ON ionic-capacitor BRANCH**
* run npx cap sync
* run npx cap open ios
* opens xcode
* run project in xcode

> (beware of cocoapods, ruby and pod installation, it might be needed to set capacitor to work)

## Detalhes da Aplicação

Quando fazes o build com o Capacitor:

1. O frontend Angular/Ionic (HTML, CSS, TypeScript) é compilado para ficheiros estáticos (`index.html`, `main.js`, etc.) — exatamente como uma PWA.
2. Esses ficheiros são injetados dentro de uma app nativa mínima, que:
   * contém uma WebView (no iOS é um `WKWebView`, no Android é um `WebView`),
   * e usa código nativo Swift/Objective-C (no iOS) ou Kotlin/Java (no Android) apenas para carregar o conteúdo web e ligar aos plugins nativos.

Portanto, visualmente e funcionalmente, o utilizador não vê uma página web — vê uma app completa, instalada a partir da App Store / Google Play, com ícone, splash screen, permissões, e integrações nativas.
A `WebView` é apenas o “motor de rendering”, mas tudo o resto (navegação, sensores, câmara, notificações, etc.) pode ser feito via plugins Capacitor, que executam código nativo real.