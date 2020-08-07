<script>
// let a = ["apple", "najn", "df"];
let a = [
  {
    name : "heena"
  },
  {
    name : "jaya"
  },
  {
    name : "anurag"
  },
  {
    name : "billo"
  }
]
let c;
let coChoices = [];
const b = () =>{
    // // a = a.filter(p => a.pop())
    // a.splice(-1, 1, "cherry", "strawberry")
    // a = a
    coChoices = a.map(co => co.name)

};

// a.splice(-1)
</script>
<!-- <form on:submit|preventDefault> -->
  <div><h4>Course Topics</h4>
  <button on:click={b}>map</button>
      {JSON.stringify(coChoices)}
    </div>
    <!-- <hr\> -->
<!-- </form> -->
<!-- const delCO = () => {
    course.courseOutcomes = course.courseOutcomes.filter(
      co => course.courseOutcomes.pop()
    )
  }; -->