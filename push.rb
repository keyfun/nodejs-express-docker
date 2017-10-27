require 'git'

git = Git.open('./')

target = 'master'
git.add(:all=>true) 
git.commit_all("Auto Push")
git.push