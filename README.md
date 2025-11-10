# futsal_manager

to build PWA:

first commit and push
ON MAIN
after, run:
* ng build --configuration production --base-href "/futsal_manager/"
* npx angular-cli-ghpages --dir=dist/futsal-manager

---

to build ionic-capacitor:

ON ionic-capacitor BRANCH
run npx cap sync
run npx cap open ios
opens xcode
run project in xcode