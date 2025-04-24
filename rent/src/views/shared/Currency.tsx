

function Currency( { amount , format = 'fr-FR', tag = "HTG" } : any ) {
  return (
    <>
    { tag } {  new Intl.NumberFormat(format).format(Number(amount)) } 
    </>
  )
}

export default Currency