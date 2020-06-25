# medocs [![Build Status](https://api.travis-ci.org/YoupressFr/Mauvais-Traitements.svg?branch=master)](https://travis-ci.org/DavidBruant/medocs)

```sh
# Downloading the files
npm run download

# Building small data from 
npm run build

# extracting the first 1000 rows
gunzip -c data/OPEN_PHMEV_2016.zip | head -n 1000 > build/head_phmev_2016.csv
gunzip -c data/OPEN_MEDIC_2016.zip | head -n 1000 > build/head_medic_2016.csv

# showing some stats
npm start
# then open http://localhost:8080/ in a browser
```
