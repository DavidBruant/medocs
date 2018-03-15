# medocs

```sh
# extracting the first 1000 rows
gunzip -c data/OPEN_PHMEV_2016.zip | head -n 1000 > build/head_phmev_2016.csv
gunzip -c data/OPEN_MEDIC_2016.zip | head -n 1000 > build/head_medic_2016.csv

# showing some stats
npm start
```