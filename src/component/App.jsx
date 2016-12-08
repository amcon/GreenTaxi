import React, { Component } from 'react';
import styles from './App.css';
import Header from './Header/Header.jsx';
import Filter from './Filter/Filter.jsx';
import Graph from './Graph/Graph.jsx';
import Search from './Search/Search.jsx';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      historyData: [],
      predictResponse: [],
      origAddress: '',
      origLat: '',
      origLong: '',
      destAddress: '',
      destLat: '',
      destLong: '',
      distance: '',
      month: 1,
      day: 1,
      dataToShow: [],
      chartTitle: '',
      xAxisLabel: 'Hour',
      yAxisLabel: 'Price',
      temperature: null,
      rainfall: ''
    }
  }

  componentDidMount(){
    this.getHistory();
  }

  getHistory () {
    fetch(`http://localhost:4000/history`)
    .then(r => r.json())
    .then((response) => {
      const filtered = this.filterHistoricalData(response);
      this.setState({
        historyData: response,
        dataToShow: filtered,
        chartTitle: `Price vs. Time for an Average ${this.state.day} in ${this.state.month}`,
      });
    })
    .catch(err => console.log(err));
  }

  getLocation() {
    fetch('http://localhost:3000/api/location', {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({
        originAddress: this.state.origAddress,
        destinationAddress: this.state.destAddress
      }),
    })
    .then(r => r.json())
    .then(data => {
      this.setState({
        origLat: data.origin_lat,
        origLong: data.origin_long,
        destLat: data.dest_lat,
        destLong: data.dest_long,
        distance: data.distance,
        temperature: data.temperature,
        rainfall: data.rainfall,
      });
      getPrediction().bind(this)
    })
    .catch(err => console.log(err));
  }

  getPrediction(){
    fetch(`http://localhost:4000/prediction`, {
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      method: 'POST',
      body: JSON.stringify({
        origLat: this.state.origLat,
        origLong: this.state.origLong,
        destLat: this.state.destLat,
        destLong: this.state.destLong,
        distance: this.state.distance,
        month: this.state.month,
        day: this.state.day,
      }),
    })
    .then(r => r.json())
    .then((response) => {
      const filtered = this.filterPredictionData(response)
      this.setState({
        predictResponse: response,
        dataToShow: filtered,
      });
    })
    .catch(err => console.log(err));
  }

  updateAddress (e) {
    this.setState({
      origAddress: e.target.value
    });
  }

  updateDestination (e) {
    this.setState({
      destAddress: e.target.value
    });
  }

  updateMonth (e) {
    this.setState({
      month: e.target.value
    });
  }

  updateDay (e) {
    this.setState({
      day: e.target.value
    });
  }

  filterHistoricalData(data) {
    let values = [];
    data.forEach((entry) => {
      if (entry.month == this.state.month && entry.day == this.state.day) {
        values.push({x: entry.hour, y: entry.price});
      }
    });
    const final = [
      {
        name: 'Historical Data',
        values: values,
      },
    ];
    return final;
  }

  filterPredictionData(response){
    let values = response.map((item) => {
      return {x: item.hour, y: item.price};
    });
    const final = [
      {
        name: 'Prediction Results',
        values: values,
      }
    ];
    return final;
  }

  render() {
    return (
      <div className={styles["App"]}>
        <Header />
        <div className={styles["side-bar"]}>
          <Filter
            updateMonth={event => this.updateMonth(event)}
          />
          <Search
            updateAddress={event => this.updateAddress(event)}
            updateDestination={event => this.updateDestination(event)}
            updateDay={event => this.updateDay(event)}
            doSearch={this.getLocation.bind(this)}
          />
        </div>
        <div className={styles["graph-container"]}>
          <Graph
            data={this.state.dataToShow}
            chartTitle={this.state.chartTitle}
            xAxisLabel={this.state.xAxisLabel}
            yAxisLabel={this.state.yAxisLabel}
          />
        </div>
      </div>
    );
  }
}

export default App;
