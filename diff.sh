cd ./reports
diff -u `ls | sort | tail -2` | ydiff -s
