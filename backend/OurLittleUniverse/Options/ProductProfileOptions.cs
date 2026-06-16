namespace LoveUniverse.Api.Options;

public sealed class ProductProfileOptions
{
    public ProductProfileMode Mode { get; set; } = ProductProfileMode.Portfolio;
}

public enum ProductProfileMode
{
    Portfolio = 1,
    Product = 2
}
