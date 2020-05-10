FROM mongo

COPY init.json /init.json
CMD mongoimport --host mongodb --db covid --collection Covid19 --type json --file /init.json --jsonArray