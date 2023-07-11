import React, { Component } from "react";
import { ClipLoader } from 'react-spinners';
import './style.css';

// expected type of the objects from the api
interface apiResults {
  id : number;
  text : string;
  date : string;
  phase : string;
}

interface AppState {
  query? : string;
  currResults : apiResults[];
  lastQuery? : string;
  limit : number;
  loading : boolean;
}


export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = {currResults : [], limit :10, loading : false};
  }
  
  render = (): JSX.Element => {
    const table : JSX.Element = this.getTable();
    let spin : JSX.Element = <div></div> 
    if (this.state.loading) {
      spin = <ClipLoader color="#000000" />
    }
    return (
      <div className="container">
        <h2>TextNext Patent Search Machine</h2>
        <p>Enter a key word to view related Patents and relevant information</p>
          <input type="text" className="SearchBar" value={this.state.query} 
          onChange={ (evt) => this.setQuery(evt.target.value)} 
          placeholder="Search..."></input>
          <button type="submit" className="button" onClick={() => {
            this.handleSubmit(this.state.query, this.state.limit)}}>Search</button>
        <div>
          {table}
          {spin}
        </div>
      </div>
    );
  };

  // Creates the table displaying the results from the api
  getTable = () : JSX.Element => {
    if (this.state.currResults.length === 0) {
      return <div></div>;
    } else {
      const results : apiResults[] = this.state.currResults.slice(0);
      return (
        <div>
                <table className="table">
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th className="description-column">Desciption</th>
                        <th>Date</th>
                        <th>Phase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((element, index) => (
                        <tr key={index + 1}>
                            <td>{element.id}</td>
                            <td>{element.text}</td>
                            <td>{element.date}</td>
                            <td>{element.phase}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => {
                this.setState({limit : this.state.limit+10})
                this.handleSubmit(this.state.lastQuery, this.state.limit + 10)}} className="button">Load More Results</button>
                </div>
      );
    }
  }

  /* fetches the data from the api using a heroku server to avoid error involving 
   * the  no CORS header on the server side, uses the limit to speed up process,
   * lmit is incremented as user requests for more results
  */
  handleSubmit = (query : string | undefined, limit : number) : void => {
    this.setState({loading:true});
    if (this.state.query !== undefined) {
      fetch('https://polar-tundra-70264-53a784a4c44e.herokuapp.com/testtechnext1-pearl118.b4a.run/search/api/query/?query=' 
    + encodeURIComponent(JSON.stringify(query)) + '&limit=' + (JSON.stringify(limit)) 
    , {
      method:'GET'
    })
    .then(this.handleApiResults).catch(this.handleServerError);
    } else {
      console.error("No query specified");
    }
  }

  // parses Json and catchds any errors from the response
  handleApiResults = (res : Response) : void => {
    if (res.status === 200) {
      res.json().then(this.handleApiJson).catch(this.handleServerError);
    } else {
      console.log("in else branch");
      this.handleServerError;
    }
  }

  // processes the values returned from the api
  handleApiJson = (vals : any) : void => {
    if (vals === undefined) {
      console.error("API data undefined");
      return;
    }
    if (!Array.isArray(vals)) {
      console.error("API data not Array");
      return;
    }
    const data : apiResults[] = []
    for(let i = 0; i < vals.length; i++) {
        if (!this.checkResult(vals[i])) {
          console.error("unexpected Object from API")
        } else {
          vals[i].text = this.trimHelp(vals[i].text);
          vals[i].phase = this.trimHelp(vals[i].phase);
          data.push(vals[i]);
        }
    }
    
    this.setState({currResults : data, lastQuery : this.state.query, loading : false});
  }

  // sets the state to what is typed 
  setQuery = (s : string) : void => {
    this.setState({query : s});
  }

  // error message for api calls
  handleServerError = () : void => {
    console.log("Uknown ServerError");
  }

  // checks that the obj is the same type we want
  checkResult = (obj : any) : boolean => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      typeof obj.id === 'number' &&
      'text' in obj &&
      typeof obj.text === 'string' &&
      'date' in obj &&
      typeof obj.date === 'string' &&
      'phase' in obj &&
      typeof obj.phase === 'string'
    );
  }

  trimHelp = (s : string) : string => {
    return s.substring(2, s.length-3).trim();
  }

}
