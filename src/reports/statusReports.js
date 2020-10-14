import React, { useEffect, useState } from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import Layout from "../layout/layout"
import Octokit from "@octokit/rest"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { MDXProvider } from "@mdx-js/react"
import showdown from "showdown"
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from 'react-date-range';

const converter = new showdown.Converter() //Used to render the content of Pull Request bodies as HTML
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN}); // Authenticated API access
const thisDate = new Date() // Reference to today
const twoWeeksAgo = new Date() // Reference to two weeks ago from today
twoWeeksAgo.setDate(thisDate.getDate() - 14)
const summRegex = /(?<=Summary\s*)[\s\S]*?(?=\s*##)/g // The regex used to pull Summaries from PR bodies.

//START main functional component that generates the page
const StatusReport = () => {

  //Our initial date range
  const [dateRange, setDateRange] = useState([
      {
        startDate: twoWeeksAgo,
        endDate: thisDate,
        key: 'selection'
      }
    ]) 

  
  //Pull requests Data construction
  const [data, setData] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      const response = await octokit.pulls.list({
        owner: "pantheon-systems",
        repo: "documentation",
        state: "closed",
        sort: "updated",
        per_page: "30",
        page: "1",
        direction: "desc",
      })
      //console.log('response :: ', response) //For Debugging
      setData(response.data)
    };
    fetchData()
  }, [])

  

  // Constructs a unique array of labels found amongst the GitHub data
  const labelDump = []
  data.map(item => {
    item.labels.map(label => {
      labelDump.push(label.name)
    })
  })
  //console.log("labels array: ", labels) //For Debugging
  const uniqueLabels = new Set(labelDump)
  const labels = [...uniqueLabels]

  // Construct checkboxes to filter on labels.
  const [allChecked, setAllChecked] = useState(false)
  const [isChecked, setIsChecked] = useState([null
    /*labels.map(label => {
      return (
        {'label' : label},
        {isChecked : false}
      )
    })*/
  ])
  
  const [loading, setLoading] = useState(true)

  const handleAllCheck = (e) => {
    setAllChecked(e.target.checked)
  }
  const handleSingleCheck = e => {
    let index
    if (e.target.checked) {
      setIsChecked(  isChecked.length ? [ ...isChecked, e.target.name] : [e.target.name]  )
      console.log(isChecked)
    }
    else {
      index = isChecked.indexOf(e.target.value)
      isChecked.splice(index, 1)
      console.log(isChecked)
    }
  };

  useEffect(() => {
    if (!loading) {
    setIsChecked(current => {
      const nextIsChecked = {}
      Object.keys(current).forEach(key => {
        nextIsChecked[key] = allChecked;
      })
      return nextIsChecked;
    });
    }
  }, [allChecked, loading]);

  useEffect(() => {
    const initialIsChecked = data.reduce((acc,d) => {
      acc[d.name] = false;
      return acc;
    }, {})
    setIsChecked(initialIsChecked)
    setLoading(false)
  }, [loading])

  return (
    <>
    <Layout>
    <main id="report">
    <div className="container doc-content-well">
      <h2> Recently Merged PRs </h2>
      <div>
      <center>
        <DateRange
          editableDateInputs={true}
          onChange={item => setDateRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
          months={2}
          direction="horizontal"
        />
        </center>
      </div>
      <div>
        <form>
          <label>
          <input
            name="checkall"
            type="checkbox"
            checked={allChecked}
            onChange={handleAllCheck}
          />
          All &nbsp;
          </label>
        {labels.map((name, i) => {
          return (
            <label>
              <input
                name={name}
                type="checkbox"
                value={name.toString()}
                onChange={handleSingleCheck}
              />
              {name} &nbsp;
            </label>
          )
        })}
        </form>
      </div>
      <hr />
      <section id="summaries" className="doc article col-md-9 md-70">

        {data.filter(item => {
          var mergeDate = new Date(item.merged_at)
          //console.log("dateRange[0].startDate: ", dateRange[0].startDate)
          //console.log("mergeDate: ", mergeDate)
          return (
            dateRange[0].startDate < mergeDate &&
            dateRange[0].endDate >= mergeDate
          )
        }).filter(item => {
          return (item.labels && isChecked.length > -1
            ? item.labels.filter(
                label => label.name.indexOf(isChecked) > -1
              ).length
            : item
          )})
        .map((item) => {
          //var date = new Date(item.closed_at)
          var mergeDate = new Date(item.merged_at)
          var summary = summRegex.exec(item.body)
          //console.log("summary: ", item.body.match(summRegex)) //For Debugging
          //console.log("Body:", item.body)//For Debugging
          return (
            <>
              {
                (item.body.match(summRegex) && item.merged_at) ?
                  <>
                  <div id={item.id} dangerouslySetInnerHTML={{
                    __html: converter.makeHtml(item.body.match(summRegex).toString() + ` <a href=${item._links.html.href}>PR ${item.number}</a>`)
                  }}/>
                  </>
                : (item.merged_at) ?
                  <>
                  <div id={item.id} dangerouslySetInnerHTML={{
                    __html: converter.makeHtml(item.body.toString() + ` <a href=${item._links.html.href}>PR ${item.number}</a>`)
                  }} />
                </>
                : null
              }
              <br />
            </>
          )
        })}
        </section>
    </div>
    </main>
    </Layout>
    </>
  );
};

export default StatusReport
