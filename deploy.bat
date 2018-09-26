git config user.name "snst.lab"
git remote rm origin
git remote add origin git@github.com:snst-lab/rescuemap-at-kamakura.git
git add .
git commit -a -m "update"
git push origin master