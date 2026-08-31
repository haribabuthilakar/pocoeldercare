export interface ServiceCatalogVersionData {
  id: string;
  serviceCatalogId: string;
  version: number;
  pricePaise: number;
  requiredCertifications: string[];
}

export interface PackageVersionData {
  id: string;
  packageId: string;
  version: number;
  monthlyPricePaise: number;
  serviceQuotas: {
    serviceCatalogId: string;
    monthlyUnits: number;
  }[];
}

export interface ResolvedServicePricing {
  serviceCatalogVersionId: string;
  packageVersionId?: string;
  unitPricePaise: number;
  isIncludedInPackageQuota: boolean;
  monthlyQuotaAllowance: number;
  requiredCertifications: string[];
}

/**
 * Resolves grandfathered service pricing and quota allowances pinned to immutable version IDs per D-25 and D-63.
 */
export function resolveServicePricing(
  serviceVersion: ServiceCatalogVersionData,
  subscriptionPackageVersion?: PackageVersionData | null
): ResolvedServicePricing {
  let isIncludedInPackageQuota = false;
  let monthlyQuotaAllowance = 0;

  if (subscriptionPackageVersion) {
    const quotaMatch = subscriptionPackageVersion.serviceQuotas.find(
      (q) => q.serviceCatalogId === serviceVersion.serviceCatalogId
    );

    if (quotaMatch && quotaMatch.monthlyUnits > 0) {
      isIncludedInPackageQuota = true;
      monthlyQuotaAllowance = quotaMatch.monthlyUnits;
    }
  }

  return {
    serviceCatalogVersionId: serviceVersion.id,
    packageVersionId: subscriptionPackageVersion?.id,
    unitPricePaise: serviceVersion.pricePaise,
    isIncludedInPackageQuota,
    monthlyQuotaAllowance,
    requiredCertifications: serviceVersion.requiredCertifications ?? []
  };
}
