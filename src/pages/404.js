import React from "react"
import { Link, graphql } from "gatsby"
import Helmet from "react-helmet"
import Layout from "../layout/layout"
import SEO from "../layout/seo"
import SVG404 from "../../source/images/404_dark.svg"
import AddSearchClient from 'addsearch-js-client'
import AddSearchUI from 'addsearch-search-ui'
import SearchField from '../components/searchField'
import SearchResults from "../components/nativeSearchResults"

class NotFoundPage extends React.Component {

  constructor(props) {
    super(props)
    this.addSearchClient = new AddSearchClient("a7b957b7a8f57f4cc544c54f289611c6")
    var addSearchConf = {
      debug: true,
//      display_url: true,
//      display_resultscount: false,
//      display_sortby: false,
//      display_category: true,
//      automatic_match_all_query: false,
//      number_of_results: 4,
    }
    this.addSearchUI = new AddSearchUI(this.addSearchClient, addSearchConf)
  }

  componentDidMount() {
    const { pathname } = this.props.location
    var searchPath = pathname.replace(/\//g, "").replace(/-/g, " ")
    var searchPath = searchPath.replace("docs", "")
    window.location.href.toString().includes("search")
      ? null
      : (window.location = ` 404?search=${searchPath}`)

    var addSearchConf = {
      display_url: true,
      display_resultscount: false,
      display_sortby: false,
      display_category: true,
      automatic_match_all_query: false,
      number_of_results: 4,
    }
    
    function searchCallback(res) {
    //console.log("res: ", res) // For Debugging
    res.hits.map(hit => {
      searchResults.push(hit)
    })}

   // console.log("searchResults: ", searchResults) // For Debugging
    this.addSearchUI.start();
    this.addSearchClient.search("test wordpres")
    
  }



  render() {
    const { pathname } = this.props.location
    const {
      data: { homeYaml },
    } = this.props
    



    return (
      <>
      <Layout type="404">
        <SEO
          title="404"
          description="Zoinks! You've hit a URl that doesn't exist. Let's try a search:"
        />
        <div style={{ marginTop: "-20px" }} className="container">
          <div className=" doc-content-well">
            <div className="mb-70">
              <img className="notfound" src={SVG404} />

              <h2>Sorry, there's no page at that URL.</h2>
              <h3>
                You can try one of the links below, or go{" "}
                <Link to="/"> back to all docs</Link>?
              </h3>
              <div className="row">
                <div
                  className="col addsearch-container"
                  style={{ width: "45%", float: "left" }}
                >
                  <h2 className="subtitle">Similar Pages</h2>
                  {/*<ul>
                    {searchResults.map(hit => {
                      return (

                        <li key={hit.id}>
                        {hit.title}
                        </li>
                      )
                    })}
                  </ul>*/}
                  <SearchResults ui={this.addSearchUI} />
                </div>
                <div className="col" style={{ width: "45%", float: "right" }}>
                  <h2 className="subtitle">{homeYaml.fourohfourlinks.title}</h2>
                  <br />
                  <ul
                    style={{
                      listStyleType: "none",
                      marginTop: "20px",
                      maxWidth: "75%",
                    }}
                  >
                    {homeYaml.fourohfourlinks.links.map(link => {
                      return (
                        <li
                          key={link.url}
                          style={{
                            fontSize: "20px",
                            marginBottom: "20px",
                            paddingBottom: "10px",
                            borderBottom: "1px solid #a4bbc1",
                          }}
                        >
                          <Link to={link.url}>{link.text}</Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      </>
    )
  }
}

export default NotFoundPage

export const pageQuery = graphql`
  {
    homeYaml {
      fourohfourlinks {
        title
        links {
          text
          url
        }
      }
    }
  }
`
