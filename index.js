require('dotenv').config()
const express = require('express')
const app = express()
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const FileSync = require('lowdb/adapters/FileSync')
const axios = require('axios')

//const adapter = new FileSync('coronadb.json')

const readadapter = new FileAsync('coronadb.json')
low(readadapter)
    .then(db => {
        app.get('/countries', (req, res) => {
            //const post = db.get('countries.' + req.query.country + '.provinces.' + req.query.provnice)
            const post = db.get('countries.' + req.query.country + '.provinces.' + req.query.province)
                .value()
            console.log(post)
            res.send(post)
        })
    })
    .then(() => {
        app.listen(3000, () => {console.log('Listening on port 3000!')})
    })


async function getData(country) {
    var queries = ''
    if (country == 'none') {
        queries = ''
    } else {
        queries = '?country=' + country
    }
    var resp = axios({
        method: 'get',
        url: 'https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats' + queries,
        headers: {
            'X-RapidAPI-Host': process.env.HOST,
            'X-RapidAPI-Key': process.env.KEY
            },
        //transformResponse: []
        })
        
        .then(function (response) {
            if (country == 'none') {
                console.log('Data for all countries recieved!')
            } else {
                console.log('Data for ' + country + ' recieved!')
            }
            return response
        })
        .catch(function (error) {
            console.log(error)
            return error
        })
    return await resp
}


async function updateUS() {
    const adapter = new FileSync('coronadb.json')
    const db = low(adapter)
    var usdata = await getData('US')
    usdata = usdata.data
    //var usdata = require('./USProv.json')
    for (i=0; i < usdata.data.covid19Stats.length; i++) {
        var name = usdata.data.covid19Stats[i].province
        var confirmed = usdata.data.covid19Stats[i].confirmed
        var deaths = usdata.data.covid19Stats[i].deaths
        db.set('countries.US.provinces.' + name + '.confirmed', confirmed)
            .write()
        db.set('countries.US.provinces.' + name + '.deaths', deaths)
            .write()
    }
}

async function updateAus() {
    const adapter = new FileSync('coronadb.json')
    const db = low(adapter)
    var usdata = await getData('Australia')
    usdata = usdata.data
    for (i=0; i < usdata.data.covid19Stats.length; i++) {
        var name = usdata.data.covid19Stats[i].province
        var confirmed = usdata.data.covid19Stats[i].confirmed
        var deaths = usdata.data.covid19Stats[i].deaths
        db.set('countries.Australia.provinces.' + name + '.confirmed', confirmed)
            .write()
        db.set('countries.Australia.provinces.' + name + '.deaths', deaths)
            .write()
    }
}

async function updateDB(country) {
    const adapter = new FileSync('coronadb.json')
    const db = low(adapter)
    var usdata = await getData(country)
    usdata = usdata.data
    for (i=0; i < usdata.data.covid19Stats.length; i++) {
        var name = usdata.data.covid19Stats[i].province
        var confirmed = usdata.data.covid19Stats[i].confirmed
        var deaths = usdata.data.covid19Stats[i].deaths
        db.set('countries.' + country + '.provinces.' + name + '.confirmed', confirmed)
            .write()
        db.set('countries.' + country + '.provinces.' + name + '.deaths', deaths)
            .write()
    }
}

async function countyList(country) {
    const adapter = new FileSync('countryList.json')
    const db = low(adapter)
    var usdata = await getData(country)
    usdata = usdata.data
    for (i=0; i < usdata.data.covid19Stats.length; i++) {
        var name = usdata.data.covid19Stats[i].province
        db.get('countries.' + country)
        .push(name)
        .write()
    }
}

setInterval(updateDB, 900000, 'Australia')
    //.catch(function (error) {console.log(error)})

setInterval(updateDB, 900000, 'US')
    //.catch(function (error) {console.log(error)})