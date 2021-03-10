# Doctolib alerter

The goal of this tool is to check the availablity of vaccination centers for COVID-19.

The tool can download and extract the data from [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/lieux-de-vaccination-contre-la-covid-19/) for centers using [Doctolib](https://www.doctolib.fr/) for booking.

## Configuration

First of all, you need to create `config.json` file. You can check the file [config.example.json](./config.example.json) to create your config file.

## How to docker (recommended)

Once you created your config file, the only thing you need to do is to build and run the docker container.

```bash
docker run -it \
    -v $(pwd)/config.json:/app/config.json:ro \
    -e POSTAL_PATTERN='^13\w+' \
    -e INTERVAL='30' \
    $(docker build . -q)
```

## How to manual

First you need to install all the dependencies.

```bash
npm install
```

### Retrieve the list of centers

The first step is to retrieve the list of the centers you want to check availability. Running this command will create a file `centers.json` containing all the vaccination centers to check.

```bash
npm start --silent -- retrieve --postal_pattern '^13\w+' # list centers in Bouches-du-Rhône
npm start --silent -- retrieve --postal_pattern '13127' # list centers in Vitrolles
```

### Check the availability of centers

The last step is to check the availability of all the vaccination you retrieved in the previous step. When a center is available, a notification will be send to the list of people to be notified.

```bash
npm start --silent -- check --interval '30' # check every 30 seconds
```
